const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Import models
const sequelize = require('./config/database');
const User = require('./models/User');
const VerificationDocument = require('./models/VerificationDocument');
const Job = require('./models/Job');
const JobApplication = require('./models/JobApplication');
const Notification = require('./models/Notification');
const Report = require('./models/Report');
const Payment = require('./models/Payment');
const Message = require('./models/Message');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Uploads folder created at:', uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Auth middleware
const auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, 'secretkey');
        const user = await User.findByPk(decoded.userId);
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        req.userId = user.id;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ========== TEST ENDPOINTS ==========
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!', timestamp: new Date() });
});

app.get('/api/test-users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json({ success: true, count: users.length, users });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// ========== REGISTER ==========
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role, phone, address, business_name } = req.body;
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already taken' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword, role, phone, address,
            business_name: business_name || null,
            is_verified: false,
            verification_status: 'none'
        });
        
        await VerificationDocument.create({ user_id: user.id, status: 'pending' });
        
        res.json({ 
            success: true, 
            message: 'Registration successful! Please login.',
            user: { id: user.id, name, email, role, is_verified: false }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ========== LOGIN ==========
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid password' });
        
        if (!user.is_active) return res.status(401).json({ error: 'Account disabled' });
        
        const token = jwt.sign({ userId: user.id }, 'secretkey');
        res.json({ 
            success: true, 
            token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified,
                verification_status: user.verification_status
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== GET PROFILE ==========
app.get('/api/profile', auth, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            business_name: user.business_name,
            is_verified: user.is_verified,
            verification_status: user.verification_status,
            rating: user.rating,
            profile_image: user.profile_image
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== SUBMIT VERIFICATION ==========
app.post('/api/submit-verification', auth, upload.fields([
    { name: 'validId', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'businessPermit', maxCount: 1 },
    { name: 'nbiClearance', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('📸 Verification submission received');
        
        const user = req.user;
        let verification = await VerificationDocument.findOne({ where: { user_id: user.id } });
        
        if (!verification) {
            verification = await VerificationDocument.create({ user_id: user.id });
        }
        
        if (req.files && req.files['validId']) {
            verification.valid_id_path = req.files['validId'][0].path;
        }
        if (req.files && req.files['resume']) {
            verification.resume_path = req.files['resume'][0].path;
        }
        if (req.files && req.files['businessPermit']) {
            verification.business_permit_path = req.files['businessPermit'][0].path;
        }
        if (req.files && req.files['nbiClearance']) {
            verification.nbi_clearance_path = req.files['nbiClearance'][0].path;
        }
        
        if (req.body.skills) verification.skills = req.body.skills;
        if (req.body.experience_years) verification.experience_years = req.body.experience_years;
        if (req.body.hourly_rate) verification.hourly_rate = req.body.hourly_rate;
        
        verification.status = 'pending';
        verification.submitted_at = new Date();
        await verification.save();
        
        user.verification_status = 'pending';
        await user.save();
        
        console.log('✅ Verification submitted successfully for user:', user.name);
        res.json({ success: true, message: 'Documents submitted successfully' });
        
    } catch (err) {
        console.error('❌ Verification error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ========== GET VERIFICATION STATUS ==========
app.get('/api/verification-status', auth, async (req, res) => {
    try {
        const user = req.user;
        const verification = await VerificationDocument.findOne({ where: { user_id: user.id } });
        
        const requirements = user.role === 'worker' 
            ? ['Valid ID', 'Resume/CV', 'Skills', 'Experience']
            : ['Valid ID', 'BIR Business Permit', 'NBI Clearance'];
        
        res.json({
            is_verified: user.is_verified,
            verification_status: user.verification_status,
            requirements: requirements,
            submitted_documents: verification ? {
                validId: !!verification.valid_id_path,
                resume: !!verification.resume_path,
                businessPermit: !!verification.business_permit_path,
                nbiClearance: !!verification.nbi_clearance_path
            } : {},
            submitted_at: verification?.submitted_at
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== POST JOB ==========
app.post('/api/jobs', auth, async (req, res) => {
    try {
        const user = req.user;
        
        if (user.role !== 'client') {
            return res.status(403).json({ error: 'Only clients can post jobs' });
        }
        
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please complete verification first' });
        }
        
        const { title, description, category, budget } = req.body;
        
        const job = await Job.create({
            client_id: user.id,
            title, description, category, budget,
            status: 'open'
        });
        
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== GET OPEN JOBS ==========
app.get('/api/jobs/open', auth, async (req, res) => {
    try {
        const jobs = await Job.findAll({
            where: { status: 'open' },
            order: [['created_at', 'DESC']]
        });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== GET MY JOBS ==========
app.get('/api/jobs', auth, async (req, res) => {
    try {
        const user = req.user;
        let jobs;
        
        if (user.role === 'client') {
            jobs = await Job.findAll({
                where: { client_id: user.id },
                order: [['created_at', 'DESC']]
            });
        } else {
            jobs = await Job.findAll({
                where: { status: 'open' },
                order: [['created_at', 'DESC']]
            });
        }
        
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== APPLY FOR JOB ==========
app.put('/api/jobs/:jobId/apply', auth, async (req, res) => {
    try {
        const user = req.user;
        const jobId = req.params.jobId;
        const { location_lat, location_lng } = req.body;
        
        console.log(`Worker ${user.id} applying for job ${jobId}`);
        
        if (user.role !== 'worker') {
            return res.status(403).json({ error: 'Only workers can apply' });
        }
        
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please complete verification first' });
        }
        
        const job = await Job.findByPk(jobId);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        if (job.status !== 'open') return res.status(400).json({ error: 'Job already taken' });
        
        const existingApplication = await JobApplication.findOne({
            where: { job_id: jobId, worker_id: user.id }
        });
        
        if (existingApplication) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }
        
        const application = await JobApplication.create({
            job_id: job.id,
            worker_id: user.id,
            status: 'pending',
            worker_location_lat: location_lat,
            worker_location_lng: location_lng,
            applied_at: new Date()
        });
        
        job.status = 'taken';
        job.worker_id = user.id;
        await job.save();
        
        await Notification.create({
            user_id: job.client_id,
            title: 'New Job Application! 📝',
            message: `${user.name} has applied for your job: ${job.title}`,
            type: 'application'
        });
        
        res.json({ success: true, message: 'Applied successfully!', application });
    } catch (err) {
        console.error('Apply error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ========== GET WORKERS NEARBY ==========
app.get('/api/workers/nearby', auth, async (req, res) => {
    try {
        const workers = await User.findAll({
            where: { role: 'worker', is_verified: true, is_active: true },
            attributes: ['id', 'name', 'phone', 'address', 'rating']
        });
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== RESUME ==========
app.post('/api/resume', auth, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'worker') {
            return res.status(403).json({ error: 'Only workers can post resume' });
        }
        
        const { skills, experience, hourlyRate, education, bio } = req.body;
        
        let verification = await VerificationDocument.findOne({ where: { user_id: user.id } });
        if (!verification) {
            verification = await VerificationDocument.create({ user_id: user.id });
        }
        
        verification.skills = skills;
        verification.experience_years = experience;
        verification.hourly_rate = hourlyRate;
        await verification.save();
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== GET RESUME ==========
app.get('/api/resume/:workerId', auth, async (req, res) => {
    try {
        const verification = await VerificationDocument.findOne({ 
            where: { user_id: req.params.workerId }
        });
        res.json(verification || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== NOTIFICATIONS ==========
app.get('/api/notifications', auth, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.userId },
            order: [['created_at', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notifications/:id/read', auth, async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { id: req.params.id, user_id: req.userId } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notifications/read-all', auth, async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { user_id: req.userId } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notifications/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.count({
            where: { user_id: req.userId, is_read: false }
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== REPORTS ==========
app.post('/api/reports', auth, async (req, res) => {
    try {
        const { reported_id, reason, description } = req.body;
        const report = await Report.create({
            reporter_id: req.userId,
            reported_id,
            reason,
            description,
            status: 'pending'
        });
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== ADMIN FUNCTIONS ==========
app.get('/api/admin/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }
        
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/verify-user/:userId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }
        
        const { status } = req.body;
        const user = await User.findByPk(req.params.userId);
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (status === 'approved') {
            user.is_verified = true;
            user.verification_status = 'verified';
        } else if (status === 'rejected') {
            user.is_verified = false;
            user.verification_status = 'rejected';
        }
        
        await user.save();
        
        await Notification.create({
            user_id: user.id,
            title: status === 'approved' ? 'Verification Approved! 🎉' : 'Verification Rejected',
            message: status === 'approved' 
                ? 'Your account has been verified! You now have full access.'
                : 'Your verification was rejected. Please contact support.',
            type: status === 'approved' ? 'verified' : 'rejected'
        });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/pending-verifications', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }
        
        const pendingDocs = await VerificationDocument.findAll({
            where: { status: 'pending' },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role', 'business_name'] }]
        });
        
        res.json(pendingDocs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/users/:userId/toggle', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }
        
        const user = await User.findByPk(req.params.userId);
        if (user) {
            user.is_active = !user.is_active;
            await user.save();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/users/:userId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }
        
        await User.destroy({ where: { id: req.params.userId } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/reports', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }
        
        const reports = await Report.findAll({
            include: [
                { model: User, as: 'reporter', attributes: ['name', 'email'] },
                { model: User, as: 'reported', attributes: ['name', 'email'] }
            ]
        });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== UPLOAD PROFILE PICTURE ==========
const profileUpload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

app.post('/api/upload-profile-image', auth, profileUpload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const user = req.user;
        const imagePath = `/uploads/${req.file.filename}`;
        
        if (user.profile_image) {
            const oldPath = path.join(__dirname, user.profile_image);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        
        user.profile_image = imagePath;
        await user.save();
        
        res.json({ 
            success: true, 
            imageUrl: `http://192.168.68.150:5000${imagePath}`
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ========== UPDATE USER LOCATION ==========
app.post('/api/update-location', auth, async (req, res) => {
    try {
        const { latitude, longitude, address } = req.body;
        const user = req.user;
        
        user.location_lat = latitude;
        user.location_lng = longitude;
        user.location_address = address;
        user.last_location_update = new Date();
        await user.save();
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== ASSOCIATIONS ==========
Job.hasMany(JobApplication, { foreignKey: 'job_id' });
JobApplication.belongsTo(Job, { foreignKey: 'job_id' });
JobApplication.belongsTo(User, { as: 'worker', foreignKey: 'worker_id' });

// ========== START SERVER ==========
sequelize.sync({ alter: true }).then(async () => {
    console.log('✅ Database connected and synced');
    
    let admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
        const hashedPassword = await bcrypt.hash('dole123', 10);
        admin = await User.create({
            name: 'DOLE Administrator',
            email: 'admin@dole.gov.ph',
            password: hashedPassword,
            role: 'admin',
            is_verified: true,
            verification_status: 'verified',
            is_active: true,
            rating: 5.0
        });
        console.log('✅ Admin created: admin@dole.gov.ph / dole123');
    }
    
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📁 Uploads folder: ${uploadDir}`);
    });
}).catch(err => {
    console.error('Database error:', err);
});
// ========== GET WORKER'S APPLICATIONS (Worker views jobs they applied for) ==========
app.get('/api/my-applications', auth, async (req, res) => {
    try {
        const user = req.user;
        
        if (user.role !== 'worker') {
            return res.status(403).json({ error: 'Only workers can view their applications' });
        }
        
        const applications = await JobApplication.findAll({
            where: { worker_id: user.id },
            include: [
                { 
                    model: Job, 
                    as: 'job',
                    include: [{ 
                        model: User, 
                        as: 'client', 
                        attributes: ['id', 'name', 'email', 'phone', 'rating', 'business_name'] 
                    }]
                }
            ],
            order: [['applied_at', 'DESC']]
        });
        
        res.json(applications);
    } catch (err) {
        console.error('Error fetching worker applications:', err);
        res.status(500).json({ error: err.message });
    }
});
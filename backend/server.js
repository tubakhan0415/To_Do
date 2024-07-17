const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 3000;
const SECRET_KEY = 'e1c35d57df5c6d8c8b60d8f1a1a5dfbb635e08e9e635df1baaa7b5b5e5e5f6a9';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf, .doc, .docx, .xls, .xlsx files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
}).single('file');

mongoose
    .connect('mongodb://localhost:27017/todo', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('Database connection error:', err));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
});

const User = mongoose.model('User', UserSchema);

const FormSchema = new mongoose.Schema({
    date: String,
    department: String,
    employeeName: String,
    managerName: String,
    employeeId: String,
    file: String,
    score: Number,
    feedback: String,
});

const Form = mongoose.model('Form', FormSchema);

const seedUsers = async () => {
    const users = [
        { username: 'Shivani', password: 'password1', role: 'sales' },
        { username: 'Jiya', password: 'password2', role: 'sales' },
        { username: 'Shashank', password: 'password3', role: 'sales' },
        { username: 'Shubham', password: 'password4', role: 'sales' },
        { username: 'Rajkumari', password: 'password5', role: 'sales' },
        { username: 'Rahul', password: 'password6', role: 'sales' },
        { username: 'Ayesh', password: 'password7', role: 'sales' },
        { username: 'Rozi', password: 'password8', role: 'sales' },
        { username: 'Vineet', password: 'password9', role: 'sales' },
        { username: 'Ronak', password: 'password10', role: 'growth' },
        { username: 'Priyesh', password: 'password11', role: 'growth' },
        { username: 'Ankit', password: 'password12', role: 'growth' },
        { username: 'Anurandhan', password: 'password13', role: 'operations' },
        { username: 'Manoj', password: 'password14', role: 'operations' },
        { username: 'Krishna', password: 'password15', role: 'marketing' },
        { username: 'Neha_Lakra', password: 'password16', role: 'marketing' },
        { username: 'Prashant', password: 'password17', role: 'it' },
        { username: 'Jolly Kumari', password: 'password18', role: 'hr' },
        { username: 'admin', password: 'adminpassword', role: 'admin' }, // Add admin user
    ];

    for (let user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await new User({ ...user, password: hashedPassword }).save();
    }
};

// Uncomment to seed users
// seedUsers();

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log('No token provided'); // Debug log
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log('Failed to authenticate token', err); // Debug log
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
        console.log('Token decoded:', decoded); // Debug log
        req.userId = decoded.id;
        req.username = decoded.username;
        req.userRole = decoded.role;
        next();
    });
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Login attempt:', { username, password }); // Debug log

    const user = await User.findOne({ username });
    if (!user) {
        console.log('User not found'); // Debug log
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('Password mismatch'); // Debug log
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ success: true, token });
});

app.post('/submit-form', upload, async (req, res) => {
    const { date, department, employeeName, managerName, employeeId } = req.body;
    const file = req.file ? req.file.path : null;

    try {
        const form = new Form({
            date,
            department,
            employeeName,
            managerName,
            employeeId,
            file,
        });

        await form.save();
        res.json({ message: 'Form submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting form', error: error.toString() });
    }
});

app.post('/update-form', authMiddleware, async (req, res) => {
    const { formId, score, feedback } = req.body;

    try {
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        form.score = score;
        form.feedback = feedback;

        await form.save();
        res.json({ message: 'Form updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating form', error: error.toString() });
    }
});

app.get('/dashboard', authMiddleware, async (req, res) => {
    const managerName = req.username;

    try {
        const forms = await Form.find({ managerName });
        res.json({ data: forms });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error: error.toString() });
    }
});

app.get('/admin-dashboard', authMiddleware, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const forms = await Form.find();
        console.log('Forms fetched:', forms); // Debug log
        res.json({ data: forms });
    } catch (error) {
        console.log('Error fetching forms:', error); // Debug log
        res.status(500).json({ message: 'Error fetching data', error: error.toString() });
    }
});

app.get('/filter-forms', authMiddleware, async (req, res) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { managerName } = req.query;

    try {
        const forms = await Form.find(managerName ? { managerName } : {});
        console.log('Filtered forms:', forms); // Debug log
        res.json({ data: forms });
    } catch (error) {
        console.log('Error filtering forms:', error); // Debug log
        res.status(500).json({ message: 'Error fetching data', error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

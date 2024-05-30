const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'teachers.json');

app.use(bodyParser.json());

// Helper functions to read and write data
const readData = () => {
    try {
        const data = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE) : '[]';
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return [];
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
    }
};

// Validate teacher data
const validateTeacher = (teacher) => {
    if (!teacher.fullName || typeof teacher.fullName !== 'string') return false;
    if (!teacher.age || typeof teacher.age !== 'number') return false;
    if (!teacher.dateOfBirth || isNaN(Date.parse(teacher.dateOfBirth))) return false;
    if (!teacher.numberOfClasses || typeof teacher.numberOfClasses !== 'number') return false;
    return true;
};

// Routes
app.get('/', (req, res) => {
    res.send('Teacher Management Home Page');
});

// Show all teachers
app.get('/teachers', (req, res) => {
    try {
        const teachers = readData();
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve teachers' });
    }
});

// Add a teacher Data
app.post('/teachers', (req, res) => {
    try {
        const teachers = readData();
        const newTeacher = req.body;

        if (!validateTeacher(newTeacher)) {
            return res.status(400).json({ error: 'Invalid teacher data' });
        }

        newTeacher.id = Date.now().toString(); // Simple unique ID generation
        teachers.push(newTeacher);
        writeData(teachers);
        res.status(201).json(newTeacher);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add teacher' });
    }
});

//Update Teacher Data
app.put('/teachers/:id', (req, res) => {
    try {
        const teachers = readData();
        const index = teachers.findIndex(t => t.id === req.params.id);
        if (index !== -1) {
            const updatedTeacher = { ...teachers[index], ...req.body };
            if (!validateTeacher(updatedTeacher)) {
                return res.status(400).json({ error: 'Invalid teacher data' });
            }
            teachers[index] = updatedTeacher;
            writeData(teachers);
            res.json(teachers[index]);
        } else {
            res.status(404).send('Teacher not found');
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update teacher' });
    }
});

//Delete Teacher Data
app.delete('/teachers/:id', (req, res) => {
    try {
        let teachers = readData();
        const index = teachers.findIndex(t => t.id === req.params.id);
        if (index !== -1) {
            teachers = teachers.filter(t => t.id !== req.params.id);
            writeData(teachers);
            res.status(204).send();
        } else {
            res.status(404).send('Teacher not found');
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete teacher' });
    }
});

// Filter by Age
app.get('/teachers/filter/age', (req, res) => {
    try {
        const age = parseInt(req.query.age);
        const teachers = readData();
        const filteredTeachers = teachers.filter(t => t.age === age);
        res.json(filteredTeachers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to filter teachers by age' });
    }
});

// Filter by Number of Classes
app.get('/teachers/filter/classes', (req, res) => {
    try {
        const numClasses = parseInt(req.query.classes);
        const teachers = readData();
        const filteredTeachers = teachers.filter(t => t.numberOfClasses === numClasses);
        res.json(filteredTeachers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to filter teachers by number of classes' });
    }
});

// Search by Name
app.get('/teachers/search', (req, res) => {
    try {
        const name = req.query.name.toLowerCase();
        const teachers = readData();
        const teacher = teachers.find(t => t.fullName.toLowerCase().includes(name));
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search for teacher' });
    }
});

// Calculate Average Number of Classes
app.get('/teachers/average-classes', (req, res) => {
    try {
        const teachers = readData();
        const totalClasses = teachers.reduce((sum, teacher) => sum + teacher.numberOfClasses, 0);
        const averageClasses = teachers.length ? totalClasses / teachers.length : 0;
        res.json({ averageClasses });
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate average number of classes' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

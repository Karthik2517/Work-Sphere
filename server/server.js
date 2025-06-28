
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, '../src/data/db.json');

// API to get all work entries
app.get('/api/work-entries', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    res.json(db.work_entries);
  });
});

// API to add a new work entry
app.post('/api/work-entries', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    const newEntry = req.body;
    newEntry.id = db.work_entries.length > 0 ? Math.max(...db.work_entries.map(e => e.id)) + 1 : 1;
    db.work_entries.push(newEntry);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error writing to database' });
      }
      res.status(201).json(newEntry);
    });
  });
});

// API to get all employees
app.get('/api/employees', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    res.json(db.employees);
  });
});

// API to update a work entry
app.put('/api/work-entries/:id', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    const entryId = parseInt(req.params.id);
    const updatedEntry = req.body;

    const index = db.work_entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
      db.work_entries[index] = { ...db.work_entries[index], ...updatedEntry, id: entryId };
      fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error writing to database' });
        }
        res.json(db.work_entries[index]);
      });
    } else {
      res.status(404).json({ message: 'Work entry not found' });
    }
  });
});

// API to delete a work entry
app.delete('/api/work-entries/:id', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    const entryId = parseInt(req.params.id);

    const initialLength = db.work_entries.length;
    db.work_entries = db.work_entries.filter(entry => entry.id !== entryId);

    if (db.work_entries.length < initialLength) {
      fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error writing to database' });
        }
        res.status(204).send(); // No Content
      });
    } else {
      res.status(404).json({ message: 'Work entry not found' });
    }
  });
});

// API to add a new employee
app.post('/api/employees', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    const newEmployee = req.body;
    newEmployee.id = db.employees.length > 0 ? Math.max(...db.employees.map(e => e.id)) + 1 : 1;
    db.employees.push(newEmployee);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error writing to database' });
      }
      res.status(201).json(newEmployee);
    });
  });
});

// API to update an employee
app.put('/api/employees/:id', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    const employeeId = parseInt(req.params.id);
    const updatedEmployee = req.body;

    const index = db.employees.findIndex(emp => emp.id === employeeId);
    if (index !== -1) {
      db.employees[index] = { ...db.employees[index], ...updatedEmployee, id: employeeId };
      fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error writing to database' });
        }
        res.json(db.employees[index]);
      });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  });
});

// API to delete an employee
app.delete('/api/employees/:id', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    const employeeId = parseInt(req.params.id);

    const initialLength = db.employees.length;
    db.employees = db.employees.filter(emp => emp.id !== employeeId);

    if (db.employees.length < initialLength) {
      fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error writing to database' });
        }
        res.status(204).send(); // No Content
      });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  });
});

// API to add a new event
app.post('/api/events', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    const newEvent = req.body;
    newEvent.id = db.events.length > 0 ? Math.max(...db.events.map(e => e.id)) + 1 : 1;
    db.events.push(newEvent);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error writing to database' });
      }
      res.status(201).json(newEvent);
    });
  });
});

// API to get all events
app.get('/api/events', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error reading database' });
    }
    const db = JSON.parse(data);
    res.json(db.events);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

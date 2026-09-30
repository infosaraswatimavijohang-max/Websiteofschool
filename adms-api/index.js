require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 4370;

// Initialize Supabase Client
// Using the Supabase credentials from your frontend code
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ohczlooperjqpyllmabo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3psb29wZXJqcXB5bGxtYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDk1MTcsImV4cCI6MjA5NDkyNTUxN30.DTgKXfFOdgHWy8C_hb8sGB6SWnfyr7J3UeVohE72ze0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware to parse plain text body (which ADMS sends)
app.use(cors());
app.use(bodyParser.text({ type: '*/*' })); // Accept any content type as text

/**
 * ZKTeco ADMS Endpoints
 */

// 1. Handshake Request
// The device makes a GET request to /iclock/cdata to check server availability and settings
app.get('/iclock/cdata', (req, res) => {
    const { SN } = req.query;
    console.log(`[ADMS] Handshake from Device SN: ${SN}`);
    
    // Server configuration string sent back to the device
    // GET OPTION FROM: SN returns the basic server configuration
    res.setHeader('Content-Type', 'text/plain');
    res.send(`GET OPTION FROM: ${SN}\nErrorDelay=60\nDelay=30\nTransTimes=00:00;14:00\nTransInterval=1\nTransFlag=1111000000\nTimeZone=5.75\nRealtime=1\nEncrypt=0`);
});

// 2. Receive Attendance Data
// The device POSTs data to this endpoint
app.post('/iclock/cdata', async (req, res) => {
    const { SN, table } = req.query;
    const bodyText = req.body;
    
    console.log(`[ADMS] Received Data from Device SN: ${SN} | Table: ${table}`);

    if (table === 'ATTLOG') {
        // Parse ATTLOG (Attendance Logs)
        // Format typically: UserID\tVerifyTime\tVerifyState\tVerifyType\tWorkCode
        // Example: 12  2026-05-31 10:00:00  0  1  0
        
        const lines = bodyText.trim().split('\n');
        const logsToInsert = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            
            // ADMS data is typically tab-separated or space-separated
            const parts = line.split(/\t|\s+/);
            
            if (parts.length >= 2) {
                const userId = parts[0];
                const datePart = parts[1];
                const timePart = parts[2]; // Sometimes date and time are split by space instead of tab
                
                let verifyTime;
                let verifyState = null;
                let verifyType = null;
                let workCode = null;

                // Handle both space-separated Date/Time and single-string DateTime
                if (datePart.includes('-') && timePart && timePart.includes(':')) {
                    verifyTime = `${datePart} ${timePart}`;
                    verifyState = parts[3] || null;
                    verifyType = parts[4] || null;
                    workCode = parts[5] || null;
                } else {
                    verifyTime = datePart;
                    verifyState = parts[2] || null;
                    verifyType = parts[3] || null;
                    workCode = parts[4] || null;
                }

                logsToInsert.push({
                    device_sn: SN,
                    user_id: userId,
                    verify_time: verifyTime,
                    verify_state: verifyState,
                    verify_type: verifyType,
                    work_code: workCode
                });
            }
        }

        if (logsToInsert.length > 0) {
            console.log(`[ADMS] Parsed ${logsToInsert.length} attendance records. Inserting to Supabase...`);
            const { data, error } = await supabase
                .from('attendance_logs')
                .insert(logsToInsert);

            if (error) {
                console.error(`[ADMS] Database Insert Error:`, error);
                return res.status(500).send("ERROR");
            }
        }
        
        res.setHeader('Content-Type', 'text/plain');
        res.send("OK");
    } 
    else if (table === 'OPERLOG') {
        // Operation Logs (e.g. user registered, admin login)
        console.log(`[ADMS] Operation Logs:\n${bodyText}`);
        res.setHeader('Content-Type', 'text/plain');
        res.send("OK");
    }
    else {
        // Other tables
        res.setHeader('Content-Type', 'text/plain');
        res.send("OK");
    }
});

// 3. Get Device Requests (Commands)
// The device queries this endpoint to check if there are any commands to execute
app.get('/iclock/getrequest', (req, res) => {
    const { SN } = req.query;
    // We return OK to indicate no commands are pending
    res.setHeader('Content-Type', 'text/plain');
    res.send("OK");
});

// 4. Device Command Execution Result
// The device posts the result of an executed command
app.post('/iclock/devicecmd', (req, res) => {
    const { SN } = req.query;
    console.log(`[ADMS] Command Result from ${SN}:\n${req.body}`);
    res.setHeader('Content-Type', 'text/plain');
    res.send("OK");
});

// Default route
app.get('/', (req, res) => {
    res.send("ADMS Attendance API is running.");
});

// Start the server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`ADMS API Server running on port ${PORT}`);
    console.log(`Waiting for biometric machine connections...`);
    console.log(`===============================================`);
});

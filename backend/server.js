const express = require('express')
const cors = requires('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/status', async (req, res) => res.send('Server running successfully!'));

app.listen(process.env.PORT, () => {
    console.log('Server running at http://localhost:5000');
})
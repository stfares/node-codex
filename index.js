const express = require('express');
const axios = require('axios')
const cors = require('cors');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

//middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT | 5000;
const initialPrompt = "<|endoftext|>/* I start with a blank HTML page, and incrementally modify it via <script> injection. Written for Chrome. */\n/* Command: Add \"Hello World\", by adding an HTML DOM node */\nvar helloWorld = document.createElement('div');\nhelloWorld.innerHTML = 'Hello World';\ndocument.body.appendChild(helloWorld);\n/* Command: Clear the page. */\nwhile (document.body.firstChild) {\n  document.body.removeChild(document.body.firstChild);\n}\n\n"
let prompt = initialPrompt

//#region get codex code start

//route - 
app.get('/', (req, res) => {
  res.send('hello world')
  // res.render('index')
})

app.get('/clear', (req, res) => {
  prompt = initialPrompt
  console.log('clear')
  res.send('Cleared previous prompts')
  
})

app.post('/code', (req, res) => {
  const query = req.body.query;
  prompt = prompt + `/* Command: ${query} */\n`
  console.log('prompt to send is', prompt);

  const data = {
    max_tokens: 2000,
    prompt,
    stop: "/* Command:",
    stream: false,
    temperature: 0,
  }
  const url = `https://api.openai.com/v1/engines/davinci-codex/completions`


  axios({
    url,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    data: Object.keys(data).length ? data : '',
  }).then((result) => {
    console.log('------------')
    console.log(result.data.choices);
    const choices = result.data.choices
    choices.length && choices.forEach(element => {
      prompt += element.text
    })
    console.log('prompt after successful post request is ', prompt);
    res.json(choices)
  }).catch((err) => {
    console.log('XXXXXXXXXXXX')
    console.log(err);
  })
})

//#endregion Image upload code end

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`)
})
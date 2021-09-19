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
let promptArr = []
const initialPrompt = "<|endoftext|>/* I start with a blank HTML page, and incrementally modify it via <script> injection. Written for Chrome. */\n/* Command: Add \"Hello World\", by adding an HTML DOM node */\nvar helloWorld = document.createElement('div');\nhelloWorld.innerHTML = 'Hello World';\ndocument.body.appendChild(helloWorld);\n/* Command: Clear the page. */\nwhile (document.body.firstChild) {\n  document.body.removeChild(document.body.firstChild);\n}\n\n"
promptArr.push(initialPrompt)

//#region get codex code start

//route - 
app.get('/', (req, res) => {
  res.send('hello world')
  // res.render('index')
})

app.get('/clear', (req, res) => {
  promptArr.length = 1
  console.log('clear', promptArr)
  res.send('Cleared previous prompts')
  
})

app.get('/revert', (req, res) => {
  promptArr.pop()
  console.log('reverted', promptArr)
  res.send('reverted previous prompt')
  
})

app.post('/remove', (req, res) => {
  const index = req.body.index
  promptArr.splice(index + 1, 1)
  const response = `removed element at index ${index}`
  console.log(response)
  res.send(response)
  
})

app.post('/code', (req, res) => {
  const query = req.body.query;
  const newQuery = `/* Command: ${query} */\n`

  let sendPrompt = promptArr.join('')
  sendPrompt = sendPrompt + newQuery
  console.log('new query is', newQuery);
  console.log('prompt to send is', sendPrompt);

  const data = {
    max_tokens: 1000,
    prompt: sendPrompt,
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
    let text = ''
    choices.length && choices.forEach(element => {
      text += element.text
    })
    newPrompt = newQuery + text
    promptArr.push(newPrompt)
    console.log('prompt array has', promptArr);
    res.json(promptArr)
  }).catch((err) => {
    console.log('XXXXXXXXXXXX')
    console.log(err);
    res.json('error while fetching data')
  })
})

//#endregion Image upload code end

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`)
})
const DEBUG=false;
let isSubmitting = false;
let enterPressed = false;
let messages = null;

async function handleSubmit(event) {
  event.preventDefault();

  if (isSubmitting) {
    return; // Exit the function if submission is already in progress
  }

  isSubmitting = true; // Set the flag to indicate submission is in progress

  const form = event.target;
  const formData = new FormData(form);
  const button = event.submitter.value;
  var prompt = formData.get('text'); // Assuming the input field has the name "text"
  const preamble = document.getElementById('preambleInput').value;
  const systemInstruction = document.getElementById('systemInstruction').value;

  if (button=='submit'){
    await chatSubmit(prompt, systemInstruction, preamble);
  }
  if (button=='record-submit') {
    record()
  }
  const textInput = form.querySelector('input[type="text"]');

  textInput.value = ''; // Clear the input field
  textInput.classList.remove('fade-out'); // Remove the fade-out class
  textInput.focus(); // Re-focus on the input element

  isSubmitting = false;
}

async function chatSubmit(prompt, systemInstruction, preamble) {
  const resultElement = document.getElementById('result');
  const resultContainer = document.getElementById('result-container');
  const openaiKey = document.getElementById('openaiKey').value;  
  const textInput = document.getElementById('textInput');

  if (messages == null) {
    messages = [{
      "role": "system",
      "content": systemInstruction.length==0 ? "You are a helpful assistant. You will provide pretty short and non-verbose answers in a simple way." : systemInstruction
    }, {
      "role": "user",
      "content": preamble + '\n ' + prompt
    }]
  }
  else {
    messages.push({"role": "assistant",
    "content": resultElement.innerText
    })
    messages.push({"role": "user",
    "content": preamble + ' ' + prompt
    })

    if (messages.length > 10) {
      messages.splice(1,1);
    }
  }
  consolePrint('Messages: ' + JSON.stringify(messages))

  const scrollToBottom = () => {
    // Function to scroll to the bottom of the result container
    const scrollHeight = resultContainer.scrollHeight;
    const clientHeight = resultContainer.clientHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const increment = 1; // Adjust the increment as needed
    let currentScrollTop = resultContainer.scrollTop;

    const scroll = () => {
      currentScrollTop += increment;
      if (currentScrollTop >= maxScrollTop) {
        resultContainer.scrollTop = maxScrollTop;
      } else {
        resultContainer.scrollTop = currentScrollTop;
        setTimeout(scroll, 1); // Adjust the delay as needed
      }
    };

    textInput.classList.add('fade-out'); // Add the fade-out class to the input element

    scroll();
  };

  // Before updating the result content, add the fade-out class
  resultElement.classList.add('fade-out');

  // Wait for the fade-out animation to complete (500ms) using a setTimeout
  await new Promise(resolve => setTimeout(resolve, 500));

  // Clear the existing content after the fade-out animation
  resultElement.innerHTML = '';

  // Remove the fade-out class to reset opacity for future results
  resultElement.classList.remove('fade-out');

  resultElement.innerHTML = ''; // Clear the existing content

  try {
    const cursorElement = document.createElement('span');
    cursorElement.id = 'cursor';
    cursorElement.innerText = '\u2588'; // Use a solid block character as the cursor

    resultElement.appendChild(cursorElement);
  

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      "model": "gpt-3.5-turbo",
      "messages": messages
    }, {
      headers: {
        'Authorization': 'Bearer ' + openaiKey,
        'Content-Type': 'application/json'
      },
      params: {
        'stream': 'true' // Enable streaming mode
      },
      responseType: 'text' // Set the response type to text
    });

    const responseText = response.data;
    consolePrint("Response text: " + responseText);
    const words = responseText.split(' ');


    let firstResponse = true;


    for (const word of words) {
      var cleanWord = word.replaceAll('\\n', '<br>').replaceAll('\\"', '"');
      const isLastWord = word.includes('"},"finish_reason":');
      
      if (firstResponse) {
        resultElement.removeChild(cursorElement);
        firstResponse = false;
        
        if (!isLastWord) {
          resultElement.innerHTML += cleanWord.split('"content":"')[1] + ' ';
        }
        else {
          cleanWord = cleanWord.split('"content":"')[1] + ' ';
          resultElement.innerHTML += cleanWord.split('"},"finish_reason":')[0] + ' ';
        }

      } else if (isLastWord) {
        resultElement.innerHTML += cleanWord.split('"},"finish_reason":')[0] + ' ';
      } else {
        resultElement.innerHTML += cleanWord + ' '; // Append each word with a space
      }

      if (!isLastWord) {
        resultElement.appendChild(cursorElement);
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay between each word (adjust as needed)
        resultElement.removeChild(cursorElement);
      }
      scrollToBottom();
    }

    ttsSubmit(resultElement.innerHTML.replaceAll('<br>', '.'));

    if (words.length > 0) {
      // Hang the cursor for one second on the last word
      resultElement.appendChild(cursorElement);
      await new Promise(resolve => setTimeout(resolve, 1300));
      resultElement.removeChild(cursorElement);
    }
    scrollToBottom();
  } catch (error) {
    resultError('Sorry, an error occured.  Please check your API keys.')
    consolePrint(`${error.message}<br><br>${error.stack}`);
  }
}

async function ttsSubmit(chatResponse) {
  const result = document.getElementById('result').innerHTML;
  const elevenLabsKey = document.getElementById('elevenLabsKey').value;
  const voiceId = 'EXAVITQu4vr4xnSDxMaL';
  const elevenLabsLatency = 3;

  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '/stream?optimize_streaming_latency=' + elevenLabsLatency,
      {
        text: chatResponse,
        voice_settings: {
          stability: 0,
          similarity_boost: 0
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer' // Set the response type to arraybuffer
      }
    );

    const oBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioURL = window.URL.createObjectURL(oBlob);
    const audio = new Audio();
    audio.src = audioURL;
    audio.play();

    // Return a promise that resolves when the audio finishes playing
    return new Promise((resolve) => {
      audio.addEventListener('ended', () => {
        resolve();
      });
    });
  } catch (error) {
    consolePrint(`${error.message}<br><br>${error.stack}`);
    // Reject the promise if an error occurs
    throw error;
  }
}

async function record() {
const resultElement = document.getElementById('result');
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
    // Microphone access granted
    consolePrint("Microphone access granted");

    recordPrompt()
    // Use the microphone stream for recording or other operations
    
  })
  .catch(function(error) {
    // Microphone access denied or error occurred
    consolePrint("Error accessing microphone:", error);
    resultError('The microphone could not be accessed. <br>Please check your permissions.')
  });
  
}

async function recordPrompt() {

}

async function resultError(string) {
  const resultElement = document.getElementById('result');

  resultElement.classList.add('fade-out');

  // Wait for the fade-out animation to complete (500ms) using a setTimeout
  await new Promise(resolve => setTimeout(resolve, 500));

  // Clear the existing content after the fade-out animation
  resultElement.innerHTML = '';

  // Remove the fade-out class to reset opacity for future results
  resultElement.classList.remove('fade-out');

  resultElement.innerHTML = string; // Set the new content

  // Add the fade-in class after a short delay to allow rendering
  setTimeout(() => {
    resultElement.classList.add('fade-in');

    // Wait for the fade-in animation to complete (500ms) using a setTimeout
    setTimeout(() => {
      resultElement.classList.remove('fade-in');
    }, 500);
  }, 50); // Adjust the delay as needed to ensure proper rendering

}


function handleEnter(event) {
  if (event.keyCode === 13 && !enterPressed) {
    enterPressed = true;
    event.preventDefault();
    document.querySelector('button[type="submit"]').click();

    // Reset the flag after a short delay to allow for another submission
    setTimeout(() => {
      enterPressed = false;
    }, 1000);
  }
}

function consolePrint(str) {
  if (DEBUG){
  const errorElement = document.getElementById('error');
  errorElement.innerHTML += '<br><br>' + str;
}
}

// Set the initial content of the response div
window.addEventListener('DOMContentLoaded', function () {
  const resultElement = document.getElementById('result');
  resultElement.innerHTML = "Hello! I am a friendly assistant.<br>Ask me anything!";

  const textInput = document.querySelector('input[type="text"]');
  textInput.addEventListener('keydown', handleEnter);
});

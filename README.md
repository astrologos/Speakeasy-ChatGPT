# Speakeasy GPT
This repository contains code for a web-based chat application called Speakeasy GPT. The application uses the OpenAI GPT-3.5 Turbo model to generate responses based on user prompts. It allows users to interact with the chatbot using text input and voice (feature in development).

## Features

- Text-based chat: Users can enter text prompts in the input field to have a conversation with the chatbot.
- Real-time streaming response: The chatbot provides streaming responses.
- Text-to-Speech: Speakeasy GPT will play high-fidelity and convincing audio of ChatGPT's responses.
- API integration: The application integrates with the OpenAI and ElevenLabs APIs to interact with the chatbot.

## Usage
To use the Speakeasy GPT application, follow these steps:

- Clone the repository or download the code files.
- Open the index.html file in a web browser.
- Ensure that you have a valid API key for the OpenAI API. This key is required for the application to function properly.
  - Enter your API key in the "OpenAI API Key" input field.
- Ensure that you have a valid API key for the ElevenLabs API. This key is required for the application to function properly.
  - Enter your API key in the "ElevenLabs API Key" input field.
- Start a conversation by typing a prompt in the text input field.
- Press the submit button or hit Enter to send the prompt to the chatbot.
- The chatbot will generate a response, which will be displayed in the result area.
- The response audio will be played.

## Dependencies
The Speakeasy GPT application relies on the following dependencies:

Axios: A promise-based HTTP client for making API requests.
The application requires a valid API key for the OpenAI API.
The application also requires a valid API key for the ElevenLabs API.

## Customization
The CSS file styles.css can be customized to change the appearance of the chat interface. You can modify the styles to match your preferred design or branding.

## Limitations
The Speakeasy GPT application relies on the OpenAI GPT-3.5 Turbo model, which has usage limits and pricing. Refer to the OpenAI documentation for more information.
The automatic speech recognition feature is still under development and not available in the current version of the application.
The user interface is somewhat limited at this point in development.

## Contributions
Contributions to the Speakeasy GPT project are welcome. If you encounter any issues or have suggestions for improvements, feel free to create an issue or submit a pull request on the GitHub repository.

## License 
This code is licensed under Creative Commons Attribution-NonCommercial (CC BY-NC).  
You can use, modify, and distribute this code for non-commercial purposes only, with proper attribution.
You can find the license here:
https://creativecommons.org/licenses/by-nc/2.0/


AKBAR-BIRBAL AI IMAGE WEBSITE

यह असली AI image-generation वाला website है। Frontend कहानी लेता है और server Gemini image API को सुरक्षित तरीके से call करता है।

चलाने के लिए:
1. Node.js इंस्टॉल करें।
2. इस folder में terminal खोलें।
3. npm install
4. .env.example को .env नाम दें।
5. .env में अपनी Gemini API key डालें:
   GEMINI_API_KEY=आपकी_key
6. npm start
7. Chrome में http://localhost:3000 खोलें।

ध्यान दें:
- 50 images के लिए API usage/limits लागू हो सकते हैं।
- API key को HTML/JavaScript में न डालें; केवल server के .env में रखें।
- यह website 16:9 image output मांगती है।

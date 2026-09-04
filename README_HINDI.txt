AKBAR-BIRBAL IMAGE STUDIO

यह वेबसाइट 16:9 YouTube के लिए 1 से 50 Akbar-Birbal story images generate करने के लिए बनाई गई है।

चलाने का तरीका:
1. Computer में Node.js install करें।
2. इस folder में terminal खोलें।
3. `npm install` चलाएँ।
4. `.env.example` की copy बनाकर उसका नाम `.env` रखें।
5. `.env` में अपना Gemini API key डालें।
6. `npm start` चलाएँ।
7. Chrome में http://localhost:3000 खोलें।
8. कहानी लिखें, 50 images चुनें और Generate Images दबाएँ।
9. हर image का Download बटन या Download All ZIP इस्तेमाल करें।

महत्वपूर्ण:
- API key को public website के frontend में न डालें। इस project में key server-side .env में रहती है।
- 50 images एक साथ generate करने पर API rate limits/quota/cost लागू हो सकते हैं। ऐप 3 images की concurrency से काम करता है और failed images को अलग दिखाता है।
- 4K विकल्प तभी उपयोग करें जब आपके चुने हुए Gemini image model/account में वह उपलब्ध हो।

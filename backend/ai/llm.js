
/*
curl -X POST https://ai.hackclub.com/chat/completions \
    -H "Content-Type: application/json" \
    -d '{
        "messages": [{"role": "user", "content": "Tell me a joke!"}]
    }'
*/

async function promptLLM(prompt) {
    return fetch("https://ai.hackclub.com/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [{ role: "user", content: prompt }]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            throw new Error("No choices returned from LLM");
        }
    })
    .catch(error => {
        console.error("Error communicating with LLM:", error);
        throw error;
    });
}

module.exports = { promptLLM };
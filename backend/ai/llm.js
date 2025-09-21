
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

async function reviewResponses(responses, reelDescription, questions) {
    const prompt = `
    You are an expert at reviewing and grading short text responses to open-ended questions.
    Here's a description of an Instagram reel: "${reelDescription}"

    Here are the questions asked: ${questions.map(q => `\n- ${q}`).join('')}

    Here are the responses to review: ${responses.map(r => `\n- ${r}`).join('')}

    For each one, grade them on the points (pts) provided in the question. If there was none provided, grade them out of 3 points.
    Once you are done, provide ONLY the numeric score for each response, in the same order as the responses were provided, in a JSON array.
    `

    const result = await promptLLM(prompt);
    return result;
}

async function generateListOfItems() {
    const prompt = `
    You are generating a list of 10 random items that players can find and take a photo of within a 5 minute time limit for a game called "TouchGrass!" 
    The players are starting inside Clark Hall on the Cornell University campus. 
    The items should be common and easily recognizable either by 1. YOLOv8 and 2. a model trained on some recognizable buildings/landmarks on Cornell's campus. 
    Some examples of items could include (but are NOT limited to): a tree, a patch of grass, a pair of scissors, a fire hydrant, a stop sign, a bench, a bicycle, etc. 
    Do NOT include items that are too obscure or hard to find on Cornell's campus (e.g. a specific statue, a specific building, etc.) THIS DOES NOT MEAN LANDMARKS LIKE THE CLOCKTOWER OR MCGRAW TOWER (ETC), THOSE ARE FINE. 
    Do NOT include items that are too similar to each other (e.g. two different types of trees), rather include items that are visually distinct from each other. 
    Do NOT include items that are not likely to be found on Cornell's campus (e.g. a beach ball, a surfboard, etc.) 
    The items should be things that can be found INDOORS on Cornell's campus. 
    The items should be things that can be found in multiple locations on Cornell's campus. 
    The items should be things that are not too small or too large. 
    The items should be things that are not too dangerous or illegal to find or take a photo of. 
    The items should be things that are not too specific to a certain location on Cornell's campus (e.g. the McGraw Tower, the Arts Quad, etc.) 
    These items can be more specific to this time of year (it is currently late September, early Fall) - for example, a fallen leaf could be valid items. 
    Make sure the items are only a couple of words long (e.g. "a tree", "a patch of grass", etc.) 
    Be funny, random and creative! Use <think>...</think> tags to think through your reasoning if needed. 
    The items should be diverse and not too similar to each other. 
    REMINDER: THESE ITEMS SHOULD BE THINGS THAT CAN BE FOUND INDOORS ON CORNELL'S CAMPUS, WITHOUT EXITING CLARK HALL. 
    Before finalizing your list, think through the list and make sure it meets all the criteria above, especially if a common YOLOv8 model would be able to recognize it. 
    Format the list as a JSON array of strings. 
    `
    let response = await promptLLM(prompt);

    //console.log("Raw LLM response:", response);
    
    // filter out <think>...<think> tags if they exist
    response = response.replace(/<think>.*?<\/think>/gs, '').trim();

    // if ```json ... ``` exists, extract the json part
    const codeBlockMatch = response.match(/```json(.*?)```/s);
    if (codeBlockMatch) {
        response = codeBlockMatch[1].trim();
    }

    // if ``` ... ``` exists, extract the json part
    const genericCodeBlockMatch = response.match(/```(.*?)```/s);
    if (genericCodeBlockMatch) {
        response = genericCodeBlockMatch[1].trim();
    }

    // if the response starts and ends with quotes, remove them
    if (response.startsWith('"') && response.endsWith('"')) {
        response = response.slice(1, -1).trim();
    }
    
    // if the response starts and ends with single quotes, remove them
    if (response.startsWith("'") && response.endsWith("'")) {
        response = response.slice(1, -1).trim();
    }
    
    // Attempt to parse the response as JSON
    try {
        const items = JSON.parse(response);
        if (Array.isArray(items) && items.every(item => typeof item === 'string')) {
            return items;
        } else {
            throw new Error("Response is not a valid array of 5 strings");
        }
    } catch (error) {
        console.error("Error parsing LLM response:", error);
        console.log(response)
        throw error;
    }
}

module.exports = { promptLLM, generateListOfItems, reviewResponses };
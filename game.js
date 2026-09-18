/*
  Project 2: Game Logic
  Author: Nevaeh George
  Date: September 18, 2026
 Theme: Bloom
    
*/

// --- GAME STATE ---
let state = {
    fuel: 100,
    food: 100,
    health: 100,
    distance: 1000,
    day: 1,
    turnsSinceLastEvent: 0, // Makess sure there's atleast 1 event every 3 turns
    gameOver: false,
    biome: 'Panic',
    inventory: [], 
    flags: {}, // Memory flags for choices like robbing the trader
    currentEvent: null
};

// --- GAME DATA ---
const biomes = { // Basic biomes that change thoughout game
    'Panic': { fuelCost: 3, foodCost: 3, eventChance: 0.40, cssClass: 'biome-panic', name: "The Panic Zone" },
    'Quarantine': { fuelCost: 2, foodCost: 4, eventChance: 0.50, cssClass: 'biome-quarantine', name: "The Military Quarantine" },
    'Deadzone': { fuelCost: 4, foodCost: 3, eventChance: 0.40, cssClass: 'biome-deadzone', name: "The Dead Zone" }
};

const dayLogs = [ // Diary logs (I like them okay?)
    "Ate some protein bars while driving. The red spore bloom on the horizon is getting thicker.",
    "The engine hums. The roads are quiet, covered in a fine layer of toxic rust dust.",
    "Passed a convoy of burned-out military trucks. Didn't stop. Kept my foot on the gas.",
    "Radio is dead. Only static and emergency loop alerts about the fungal spread.",
    "The air tastes like copper and mold. I can't afford to slow down now.",
    "Saw a flock of birds drop dead from the sky. The bloom is catching up to us.",
    "Tires keep turning. The silence out here is deafening.",
    "Found an old CD. Blasted music to drown out the sound of the wind. Kept driving."
];

// Pool of 10 random events
const events = [
    { id: 1, title: "Abandoned House", text: "Spot an abandoned house off the highway. It might contain supplies, but structural stability looks questionable.", choices: [
        {text: "Search the house (Risk Health/Food)", action: "event_house_search", style: "bg-amber-600 hover:bg-amber-500 border-amber-800"}, 
        {text: "Dismantle for firewood (+Gas, -Food)", action: "event_house_dismantle", style: "bg-blue-600 hover:bg-blue-500 border-blue-800"},
        {text: "Ignore and drive on", action: "event_ignore", style: "bg-slate-600 hover:bg-slate-500 border-slate-800"}
    ]},
    { id: 2, title: "Hostile Strangers", text: "A group of armed strangers blocks the road, demanding food.", choices: [
        {text: "Draw Shotgun (Requires Shotgun)", action: "event_shotgun_scare", reqItem: "Shotgun", style: "bg-stone-700 hover:bg-stone-600 border-stone-900"},
        {text: "Give 10 Food", action: "event_give_food", style: "bg-purple-600 hover:bg-purple-500 border-purple-800"}, 
        {text: "Drive through (Risk Health/Gas)", action: "event_drive_through", style: "bg-amber-600 hover:bg-amber-500 border-amber-800"},
        {text: "Fight them (High Risk)", action: "event_fight", style: "bg-red-600 hover:bg-red-500 border-red-800"}
    ]},
    { id: 3, title: "Severe Weather", text: "A massive dust storm approaches. Traveling now will be dangerous and cost extra resources.", choices: [
        {text: "Push through the storm (-5 Gas)", action: "event_weather_push", style: "bg-red-600 hover:bg-red-500 border-red-800"}, 
        {text: "Wait it out (-10 Food)", action: "event_wait", style: "bg-slate-600 hover:bg-slate-500 border-slate-800"},
        {text: "Set up catch-tarps (-15 Health, +15 Food)", action: "event_collect_water", style: "bg-blue-600 hover:bg-blue-500 border-blue-800"}
    ]},
    { id: 4, title: "Opportunistic Trade", text: "A lone traveler offers to trade fuel for some of your dwindling food supply.", choices: [
        {text: "Trade 10 Food for 20 Gas", action: "event_trade_accept", style: "bg-purple-600 hover:bg-purple-500 border-purple-800"}, 
        {text: "Rob them (Sets radio alert flag)", action: "event_rob", style: "bg-red-600 hover:bg-red-500 border-red-800"},
        {text: "Refuse and drive past", action: "event_ignore", style: "bg-slate-600 hover:bg-slate-500 border-slate-800"}
    ]},
    { id: 5, title: "Dilapidated Vehicle", text: "You find a broken vehicle on the shoulder. It might have spare parts or siphonnable fuel.", choices: [
        {text: "Siphon fuel (Risk Health)", action: "event_siphon", style: "bg-amber-600 hover:bg-amber-500 border-amber-800"}, 
        {text: "Search for parts/rations", action: "event_search_parts", style: "bg-blue-600 hover:bg-blue-500 border-blue-800"}, 
        {text: "Sleep inside (+Health, -Food)", action: "event_sleep_vehicle", style: "bg-emerald-600 hover:bg-emerald-500 border-emerald-800"}
    ]},
    { id: 6, title: "Active Evacuation", text: "FEMA is actively abandoning a checkpoint. Helicopters are lifting off. Tents are flapping, and they left crates of supplies on antiseptics.", biome: "Panic", unique: true, choices: [
        {text: "Loot the medical tents", action: "event_med_tent", style: "bg-blue-600 hover:bg-blue-500 border-blue-800"},
        {text: "Drive on", action: "event_ignore", style: "bg-slate-600 hover:bg-slate-500 border-slate-800"}
    ]},
    { id: 7, title: "Highway Gridlock", text: "Thousands of cars are gridlocked on the interstate from the initial panic. People just got out and ran. The road is completely blocked.", biome: "Quarantine", choices: [
        {text: "Ram through the gap", action: "event_ram", style: "bg-red-600 hover:bg-red-500 border-red-800"},
        {text: "Get out and push cars (-10 Food)", action: "event_clear_snow", style: "bg-blue-600 hover:bg-blue-500 border-blue-800"}
    ]},
    { id: 8, title: "Fungal Outgrowth", text: "Thick, pulsating crimson fungus has completely choked the overpass ahead. You have to find a way around or through it.", choices: [
        {text: "Drive through spores (Risk Health)", action: "event_spore_drive", style: "bg-amber-600 hover:bg-amber-500 border-amber-800"},
        {text: "Take a muddy detour (-10 Gas, -5 Food)", action: "event_detour", style: "bg-blue-600 hover:bg-blue-500 border-blue-800"}
    ]},
    { id: 9, title: "Rusted Radio Tower", text: "An abandoned broadcast tower still has emergency loops playing automated survival instructions.", choices: [
        {text: "Climb up to scan frequencies (+Food)", action: "event_tower_scan", style: "bg-purple-600 hover:bg-purple-500 border-purple-800"},
        {text: "Ignore it and keep moving", action: "event_ignore", style: "bg-slate-600 hover:bg-slate-500 border-slate-800"}
    ]},
    { id: 10, title: "Lone Survivor", text: "A starving survivor limps down the center stripe of the highway, waving weakly.", choices: [
        {text: "Share some rations (-5 Food, +Health)", action: "event_share_food", style: "bg-emerald-600 hover:bg-emerald-500 border-emerald-800"},
        {text: "Drive right past them", action: "event_ignore", style: "bg-slate-600 hover:bg-slate-500 border-slate-800"}
    ]}
];

// --- HTML ELEMENT CACHING ---
const uiDistance = document.getElementById("ui-distance");
const uiDay = document.getElementById("ui-day");
const uiFood = document.getElementById("ui-food");
const uiFuel = document.getElementById("ui-fuel");
const uiHealth = document.getElementById("ui-health");
const uiInventory = document.getElementById("ui-inventory");

const logBox = document.getElementById("log-box");
const decisionText = document.getElementById("decision-text");
const buttonContainer = document.getElementById("button-container");

function updateUI() {
    state.health = Math.max(0, Math.min(100, state.health));
    state.fuel = Math.max(0, state.fuel);
    state.food = Math.max(0, state.food);

    uiDay.innerText = state.day;
    uiDistance.innerText = state.distance;
    uiFood.innerText = Math.floor(state.food);
    uiFuel.innerText = Math.floor(state.fuel);
    uiHealth.innerText = state.health;
    
    if (state.inventory.length > 0) {
        uiInventory.innerText = state.inventory.join(', ');
    } else {
        uiInventory.innerText = "Empty";
    }
    
    logBox.scrollTop = logBox.scrollHeight;
}

function writeToLog(text, styleClass = "") {
    const p = document.createElement('p');
    if (styleClass !== "") {
        p.classList.add(styleClass);
    }
    p.innerText = text;
    logBox.appendChild(p);
}

function checkBiome() {
    let currentBiome = 'Panic';
    if (state.distance <= 333) currentBiome = 'Deadzone';
    else if (state.distance <= 666) currentBiome = 'Quarantine';
    
    if (state.biome !== currentBiome) {
        state.biome = currentBiome;
        document.body.className = biomes[state.biome].cssClass;
        writeToLog(`*** NOW ENTERING: ${biomes[state.biome].name} ***`, 'text-biome');
    }
}

function stopRolling() {
    document.querySelector('.layer-sky').style.animationPlayState = 'paused';
    document.querySelector('.layer-mountains').style.animationPlayState = 'paused';
    document.querySelector('.layer-hills').style.animationPlayState = 'paused';
    document.querySelector('.layer-road').style.animationPlayState = 'paused';
}

function startRolling() {
    document.querySelector('.layer-sky').style.animationPlayState = 'running';
    document.querySelector('.layer-mountains').style.animationPlayState = 'running';
    document.querySelector('.layer-hills').style.animationPlayState = 'running';
    document.querySelector('.layer-road').style.animationPlayState = 'running';
}

function processTravelTurn() {
    if (state.gameOver) return;

    const bParams = biomes[state.biome];
    
    if (state.fuel < bParams.fuelCost) {
        writeToLog("The engine sputtered and died. I'm out of gas. The spore cloud is catching up. I'm dead.", 'text-bad');
        stopRolling();
        endGame(false); 
        return;
    }

    state.day++;
    
    let healLog = "";
    if (state.health < 100) {
        state.health += 2;
        healLog = " (Caught my breath, recovered some strength)";
    }

    let randomLog = dayLogs[Math.floor(Math.random() * dayLogs.length)];
    writeToLog(`ENTRY ${state.day}. ${randomLog}${healLog}`, 'text-day');

    state.fuel -= bParams.fuelCost;
    state.food -= bParams.foodCost;
    state.distance -= 50; // Exactly 50 miles per day over 20 days
    
    checkBiome();

    if (state.food <= 0) {
        writeToLog("I haven't eaten in days. I can't keep my eyes open. The car is drifting off the road...", 'text-bad');
        stopRolling();
        endGame(false); 
        return;
    }

    if (state.distance <= 0) {
        state.distance = 0;
        updateUI();
        triggerMilitaryFinale(); 
        return;
    }

    updateUI();

    // Pacing tracker: Guarantees at least 1 event every 3 turns
    if (state.turnsSinceLastEvent >= 2 || Math.random() < bParams.eventChance) {
        state.turnsSinceLastEvent = 0;
        triggerRandomEvent();
    } else {
        state.turnsSinceLastEvent++;
        setNormalTravelUI();
    }
}

// --- 3 ENDINGS FINALE (Death, Family, or Military) ---
function triggerMilitaryFinale() {
    stopRolling();
    
    // If you robbed the trader earlier, your plates were radioed ahead to the checkpoints
    // Sorry folks, but the military doesn't take kindly to armed road bandits. You get shot on sight.
    if (state.flags.robbedTrader) {
        writeToLog(`*** THE FINAL MILE: RECKONING ***`, 'text-biome');
        writeToLog(`I pulled up to the military blockade. Before I could even open the door, an officer checked his portable terminal, frowned, and tapped his radio. "Plate matches an armed robbery report radioed ahead from three days back." They didn't even let me step out of the car. Half a dozen rifles went off at once. If you prey on people out on the road, the network catches up to you. [Death Ending]`, 'text-bad');
        updateUI();
        endGame(false);
        return;
    }

    writeToLog(`*** THE FINAL MILE ***`, 'text-biome');
    writeToLog(`I made it to my county line. A massive military barricade blocks the road. Soldiers in hazmat suits check my car. An officer walks up and looks at me. "Quarantine Zone. You can process through to reach your family behind the wall, or you can volunteer to enlist right here and help us hold the line."`, 'text-event');
    
    decisionText.innerText = `What is my final choice?`;
    buttonContainer.innerHTML = '';

    const btn1 = document.createElement('button');
    btn1.innerText = "Go to my family (Quarantine processing)";
    btn1.onclick = function() { processinaleChoice('family'); };
    buttonContainer.appendChild(btn1);

    const btn2 = document.createElement('button');
    btn2.className = "btn-action";
    btn2.innerText = "Join the military";
    btn2.onclick = function() { processinaleChoice('join'); };
    buttonContainer.appendChild(btn2);
}

function processinaleChoice(action) {
    let msg = "";
    let style = "";
    let survived = false;

    switch(action) {
        case 'family':
            msg = "I stepped out, raised my hands, and asked for my family. They hosed me down in bleach and processed me into the quarantine camp. I found them behind the wire. We're together. [Family Ending]";
            style = "text-good";
            survived = true;
            break;
        case 'join':
            msg = "I nodded, turned off the ignition, and stepped out to enlist. They handed me a hazmat suit and a rifle. I didn't go home today, but I'm wearing the uniform now. [Military Ending]";
            style = "text-good";
            survived = true;
            break;
    }

    writeToLog(msg, style);
    updateUI();
    endGame(survived);
}

function triggerRandomEvent() {
    const pool = events.filter(e => {
        if (e.biome && e.biome !== state.biome) return false;
        if (e.reqFlag && !state.flags[e.reqFlag]) return false;
        if (e.unique && state.flags['seen_' + e.id]) return false;
        return true;
    });

    if (pool.length === 0) {
        setNormalTravelUI(); 
        return;
    }

    state.currentEvent = pool[Math.floor(Math.random() * pool.length)];
    if (state.currentEvent.unique) {
        state.flags['seen_' + state.currentEvent.id] = true;
    }

    writeToLog(`*** ${state.currentEvent.title.toUpperCase()} ***\n${state.currentEvent.text}`, 'text-event');
    stopRolling(); 
    
    decisionText.innerText = `What do I do?`;
    buttonContainer.innerHTML = '';
    
    state.currentEvent.choices.forEach(choice => {
        if (choice.reqItem && !state.inventory.includes(choice.reqItem)) return; 

        const btn = document.createElement('button');
        btn.innerText = choice.text;
        btn.onclick = function() { processEventChoice(choice.action); };
        buttonContainer.appendChild(btn);
    });
}

function processEventChoice(action) {
    let msg = "";
    let style = "";

    switch(action) { // Choice outcomes for each event. Some are random, some are fixed.
        case 'event_ignore': 
            msg = "I kept my foot on the gas. Can't risk stopping while the world is ending.";
            style = "text-good";
            break;
        case 'event_house_search':
            if (Math.random() < 0.8) { 
                state.food += 20; state.health -= 5;
                msg = "Grabbed snacks from the aisles, but inhaled a little spore dust. It burns my throat. (+20 Food, -5 Health)";
                style = "text-good";
            } else {
                state.health -= 10; state.fuel -= 5;
                msg = "The rot had already eaten the support beams. The ceiling collapsed. I scrambled out quickly. (-5 Gas, -10 Health)";
                style = "text-bad";
            }
            break;
        case 'event_house_dismantle':
            state.fuel += 15; state.food -= 5;
            msg = "I ripped the hose off the pump and siphoned whatever was left in the underground tank. (+15 Gas, -5 Food)";
            style = "text-good";
            break;
        case 'event_shotgun_scare':
            msg = "I racked the 12-gauge. The unmistakable 'clack-clack' echoed, and they scrambled away. I kept driving.";
            style = "text-good";
            break;
        case 'event_give_food':
            state.food -= 10; state.health += 10;
            msg = "I threw a bag of food out the window. Stung my pride, but nobody caught a bullet. I can breathe easier. (-10 Food, +10 Health)";
            style = "text-good";
            break;
        case 'event_drive_through':
            state.health -= 15; state.fuel -= 5;
            msg = "I slammed the gas. They panicked and fired. A bullet grazed my arm. (-5 Gas, -15 Health)";
            style = "text-bad";
            break;
        case 'event_fight':
            state.food -= 15; state.health -= 20;
            msg = "Tried to run them over. They shot my tire and pulled me out of the cab. Beat me up before looting the trunk. (-15 Food, -20 Health)";
            style = "text-bad";
            break;
        case 'event_weather_push':
            state.fuel -= 5; state.health -= 10;
            msg = "Pushed through the black dust storm. Visibility was zero, banged up the bumper. (-5 Gas, -10 Health)";
            style = "text-bad";
            break;
        case 'event_wait':
            state.food -= 10;
            msg = "Pulled over and waited out the storm. Lost a day and burned through extra rations. (-10 Food)";
            style = "text-good";
            break;
        case 'event_collect_water':
            state.health -= 15; state.food += 15;
            msg = "Braved the ash storm to set up catch-tarps. Inhaled too much dust, but got fresh supplies. (+15 Food, -15 Health)";
            style = "text-good";
            break;
        case 'event_trade_accept':
            state.food -= 10; state.fuel += 20;
            msg = "I slid him the food, took the jerry can. A rare moment of humanity while the world burns. (-10 Food, +20 Gas)";
            style = "text-good";
            break;
        case 'event_rob':
            // Sets the flag internally so the checkpoint computers flag you later
            state.flags.robbedTrader = true; 
            state.fuel += 25; state.food += 20; state.health -= 10;
            if (!state.inventory.includes('Shotgun')) {
                state.inventory.push('Shotgun');
                msg = "I cheap-shotted him with a tire iron. Took his gas, his food, and pried a Shotgun from his trunk. He radioed ahead before passing out. (+25 Gas, +20 Food, -10 Health, +Shotgun)";
                style = "text-bad";
            } else {
                msg = "I beat him down and took his stash. I'm a monster, but I'm a monster with a full tank. (+25 Gas, +20 Food, -10 Health)";
                style = "text-bad";
            }
            break;
        case 'event_siphon':
            if (Math.random() < 0.7) {
                state.fuel += 20;
                msg = "Successfully siphoned clean-ish fuel from an abandoned sedan. (+20 Gas)";
                style = "text-good";
            } else {
                state.health -= 20;
                msg = "The tank was full of toxic fungal sludge. I inhaled the fumes and got sick. (-20 Health)";
                style = "text-bad";
            }
            break;
        case 'event_search_parts':
            if (Math.random() < 0.6) {
                state.food += 15;
                msg = "Found untouched protein rations in the glovebox. (+15 Food)";
                style = "text-good";
            } else {
                state.food -= 5;
                msg = "Wasted an hour searching a stripped shell. Burned calories for nothing. (-5 Food)";
                style = "text-bad";
            }
            break;
        case 'event_sleep_vehicle':
            state.health += 25; state.food -= 6;
            msg = "Found an intact camper van to lock up in. Got a full night of safe, quiet sleep. (+25 Health, -6 Food)";
            style = "text-good";
            break;
        case 'event_med_tent':
            if (!state.inventory.includes('First Aid Kit')) {
                state.inventory.push('First Aid Kit');
                msg = "I hopped out and dug through a dropped supply crate. Found an untouched First Aid Kit!";
                style = "text-good";
            } else {
                msg = "I tore the crates apart. Nothing but empty pill bottles.";
                style = "text-bad";
            }
            break;
        case 'event_ram':
            state.health -= 10;
            msg = "I floored it right into a gap between two sedans. Jarred my neck pretty bad. (-10 Health)";
            style = "text-bad";
            break;
        case 'event_clear_snow':
            state.food -= 10;
            msg = "Spent an hour pushing cars into neutral and rolling them out of the way. Burned some calories. (-10 Food)";
            style = "text-bad";
            break;
        case 'event_spore_drive':
            if (Math.random() < 0.6) {
                state.health -= 5;
                msg = "Smashed right through the fungal growth. A few spores got inside the cabin, but you pushed through. (-5 Health)";
                style = "text-good";
            } else {
                state.health -= 25; state.fuel -= 10;
                msg = "The thick fungal mass tangled in your axles. You had to hack your way out with a tire iron. (-10 Gas, -25 Health)";
                style = "text-bad";
            }
            break;
        case 'event_detour':
            state.fuel -= 10; state.food -= 5;
            msg = "Took a wide muddy path around the spores. Burned extra gas and calories, but stayed clean. (-10 Gas, -5 Food)";
            style = "text-good";
            break;
        case 'event_tower_scan':
            state.food += 20;
            msg = "Climbed the rusty ladder and found an army cache dropped near the relay. (+20 Food)";
            style = "text-good";
            break;
        case 'event_share_food':
            state.food -= 5; state.health += 10;
            msg = "Shared a ration bar with the wanderer. They smiled, gave you a lucky charm, and you felt a rare moment of peace. (-5 Food, +10 Health)";
            style = "text-good";
            break;
        default:
            msg = "I made the call.";
    }

    writeToLog(msg, style);
    state.currentEvent = null;
    updateUI();
    
    if (state.fuel <= 0 || state.food <= 0 || state.health <= 0) {
        let reason = state.health <= 0 ? "I bled out in the driver's seat." : "Without supplies, I can't outrun the bloom.";
        writeToLog(`END OF THE LINE: ${reason}`, 'text-bad');
        stopRolling();
        endGame(false); 
        return;
    }
    
    setNormalTravelUI();
}

function setNormalTravelUI() {
    const bParams = biomes[state.biome];
    decisionText.innerText = `The road is clear for now. The sky behind me is getting darker.`;
    buttonContainer.innerHTML = '';

    const driveBtn = document.createElement('button');
    driveBtn.className = "btn-action";
    driveBtn.innerText = `Keep Driving (-${bParams.fuelCost} Food/Gas)`;
    driveBtn.onclick = processTravelTurn;
    buttonContainer.appendChild(driveBtn);

    if (state.inventory.includes("First Aid Kit") && state.health < 100) {
        const medBtn = document.createElement('button');
        medBtn.innerText = `Use First Aid Kit`;
        medBtn.onclick = function() {
            state.health = Math.min(100, state.health + 40);
            state.inventory = state.inventory.filter(item => item !== 'First Aid Kit');
            writeToLog("I bit down on a rag, cleaned the wounds with alcohol, and bandaged up. (+40 Health)", "text-good");
            updateUI();
            setNormalTravelUI();
        };
        buttonContainer.appendChild(medBtn);
    }
    
    startRolling();
}

function endGame(won) {
    state.gameOver = true;
    
    decisionText.innerText = won ? "End of the line." : "This is my final entry. The spores are here.";
    
    buttonContainer.innerHTML = '';
    const restartBtn = document.createElement('button');
    restartBtn.innerText = "Close the Diary (Restart)";
    restartBtn.onclick = function() { location.reload(); };
    buttonContainer.appendChild(restartBtn);
}

// Kickoff
updateUI();
setNormalTravelUI();
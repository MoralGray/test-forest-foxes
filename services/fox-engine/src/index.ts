const BACKEND_URL = process.env.FOREST_FOXES_BACKEND_URL ?? 'http://localhost:8020';
const INTERVAL_MS = Number(process.env.FOREST_FOXES_POLL_INTERVAL_MS) || 30_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

const FOX_IDS = [
    'fox_001',
    'fox_002',
    'fox_003',
    'fox_004',
    'fox_005',
    'fox_006',
    'fox_007',
    'fox_008',
    'fox_009',
    'fox_010',
];
const COLORS = ['рыжая', 'черная', 'серебристая', 'золотистая'];
const LOCATIONS = [
    { id: 1, name: 'Северная поляна' },
    { id: 2, name: 'Туманная тропа' },
    { id: 3, name: 'Западный ручей' },
    { id: 4, name: 'Моховой овраг' },
    { id: 5, name: 'Центральная чаща' },
    { id: 6, name: 'Восточный склон' },
    { id: 7, name: 'Южное болото' },
    { id: 8, name: 'Старая берлога' },
    { id: 9, name: 'Лисья нора' },
];

function generateObservation() {
    const fox = FOX_IDS[Math.floor(Math.random() * FOX_IDS.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const hasPrey = Math.random() > 0.5;
    const suspicionLevel = Math.floor(Math.random() * 10) + 1;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const time = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const id = `obs_${Date.now()}_${String(Math.random()).slice(2, 8)}`;

    return {
        id,
        foxId: fox,
        locationId: location.id,
        color,
        hasPrey,
        suspicionLevel,
        time,
    };
}

async function postObservation(observation: ReturnType<typeof generateObservation>, attempt = 1) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/observations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(observation),
        });
        if (!response.ok) {
            console.error(`[fox-engine] POST failed (${response.status}): ${await response.text()}`);
            if (attempt < MAX_RETRIES) {
                console.log(`[fox-engine] Retry ${attempt}/${MAX_RETRIES} in ${RETRY_DELAY_MS}ms...`);
                await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
                return postObservation(observation, attempt + 1);
            }
            console.error(`[fox-engine] Max retries reached, skipping ${observation.id}`);
        } else {
            console.log(`[fox-engine] Created ${observation.id}`);
        }
    } catch (error) {
        console.error(`[fox-engine] POST error (attempt ${attempt}/${MAX_RETRIES}): ${error}`);
        if (attempt < MAX_RETRIES) {
            console.log(`[fox-engine] Retry in ${RETRY_DELAY_MS}ms...`);
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            return postObservation(observation, attempt + 1);
        }
        console.error(`[fox-engine] Max retries reached, skipping ${observation.id}`);
    }
}

console.log(`[fox-engine] Starting — posting every ${INTERVAL_MS / 1000}s to ${BACKEND_URL}`);

setInterval(() => {
    const observation = generateObservation();
    postObservation(observation).catch(() => {});
}, INTERVAL_MS);

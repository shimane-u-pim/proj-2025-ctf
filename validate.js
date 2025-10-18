const keys = {
	'1': 'NBAiTj8ktIeEP0fW7SMpmMxtDxPMbXZAsJG1UUs9/lddFSni/cAvjB5WYYQ6Rw==', // `This is tutorial`
    '2': 'Fs61OW4KPi1/AdukZ0wxHrg/SZ1Q3gQMIZ9b+S52DMnOvC3IIjAIpH26oRLUZg==',
    '3': 'LVrq9qt2cytFsasFNiTXSh9Zm8bsvSn44CBRVVP4INqw9rVn0NUbXuHE3JX3dw==',
	'4': 'Dbam+EbydtqA8XfOC6Mrr8oHQyV15HyoHtQOIuNNn1m/dw0mKkBkZ/6q5AC4ow==',
    '5': 'Y2dewzEfnqrvETR9bmwKUCMKw5HhFIEB8difMHMmc1Xs6pv7dLG9/vH57lYCtg==',
    '6': 'x/DybGduQp/RYaoAQao0u9r9iIuHz6jddmcMRToDq1vtQ/kwkF2SY+PMfHGLhw==',
	'9': 'vAvVlCrFXB1rDM71jwBin0ZgqiPLuIyMAMZbTIpxIwzvFONGTYWsZB68b/A8rA==',
    '10': 'YTLGDOSDop5x4YqyZkeYxeim6Qv5YPj0JH5EjtGL1cKTrCnsEDuQ5jAvd1aVKA==',
    '11': '6h/iqJ4R1wVk6BG9RwomYp/OOgRslsKYEuO7fEvGIWEKCWo1TAP86xCa0c44OA==',
    '12': 'qsBFOQTmI+PZbTKAEcldgyCaNzK/wwGx6qU9WYX2B3G0xUnzkY7oTS79TzD9Mg==',
    '13': 'RAh++2LC6TJSHYOAhvHPWXc8f62gnx5haSzsz67mir00mH+dZKt9+TgZNp+g7A==',
    '14': 'eCwcnNjhzpCkhHK9GiFuuE6luR2A3AkMSDV64GQlTASSSgqKAKLHVXGZvQ63Cw==',
    '15': 'TuLiNmZdxwJ6dYeOEjGBMRWyXZ5XYXyc65cu1aY3ykkv/JGVzZeHEJnKJqbY0g==',
};

// ============================================
// CODE
// ============================================

function str2ab(str) {
	return new TextEncoder().encode(str);
}

function ab2str(buf) {
	return new TextDecoder().decode(buf);
}

function ab2b64(arr) {
	return btoa(String.fromCharCode.apply(null, new Uint8Array(arr)));
}

function b642ab(b64) {
	const byteString = atob(b64);
	const byteArray = new Uint8Array(byteString.length);
	for (let i = 0; i < byteString.length; i++) {
		byteArray[i] = byteString.charCodeAt(i);
	}
	return byteArray.buffer;
}

function getKey(password, salt) {
	const keyMaterial = str2ab(password);
	return window.crypto.subtle.importKey(
		"raw",
		keyMaterial, {
			name: "PBKDF2"
		},
		false, ["deriveKey"]
	).then(baseKey =>
		window.crypto.subtle.deriveKey({
			"name": "PBKDF2",
			salt: salt,
			"iterations": 100000,
			"hash": "SHA-256"
		},
			baseKey, {
				"name": "AES-GCM",
				"length": 256
			},
			true, ["encrypt", "decrypt"]
		)
	);
}

async function encryptText(text, password) {
	if (!text || !password) {
		throw new Error("Text and password are required.");
	}

	const salt = window.crypto.getRandomValues(new Uint8Array(16));
	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const key = await getKey(password, salt);
	const encodedText = str2ab(text);

	const encryptedContent = await window.crypto.subtle.encrypt({
		name: "AES-GCM",
		iv: iv
	}, key, encodedText);

	const encryptedBuffer = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
	encryptedBuffer.set(salt, 0);
	encryptedBuffer.set(iv, salt.length);
	encryptedBuffer.set(new Uint8Array(encryptedContent), salt.length + iv.length);

	return ab2b64(encryptedBuffer);
}

async function decryptText(encryptedTextB64, password) {
	if (!encryptedTextB64 || !password) {
		throw new Error("Encrypted text and password are required.");
	}

	const encryptedBuffer = b642ab(encryptedTextB64);
	const salt = encryptedBuffer.slice(0, 16);
	const iv = encryptedBuffer.slice(16, 28);
	const data = encryptedBuffer.slice(28);

	const key = await getKey(password, new Uint8Array(salt));

	const decryptedContent = await window.crypto.subtle.decrypt({
		name: "AES-GCM",
		iv: new Uint8Array(iv)
	}, key, data);

	return ab2str(decryptedContent);
}

const assert = async () => {
	const numElem = document.getElementById('q-no');
	const ansElem = document.getElementById('q-ans');
	const submitElem = document.getElementById('q-submit');

	const ans = ansElem.value;
	const num = numElem.value;

	submitElem.disabled = true;
	numElem.disabled    = true;
	ansElem.disabled    = true;

	try {
		if (typeof keys[num] === 'undefined') {
			alert('問題番号が不正です。');
			return;
		}

		const key = keys[num];
		const decrypted = await decryptText(key, ans);

		if (decrypted === 'ok') {
			alert('正解です');
		} else {
			alert('不正解です');
		}
	}
	catch {
		alert('解答が不正です。');
	}
	finally {
		submitElem.disabled = false;
		numElem.disabled    = false;
		ansElem.disabled    = false;
	}
}

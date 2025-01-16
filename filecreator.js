var width = 1920;
var height = 1080;

function setResolution(w, h) {
    width = w;
    height = h;
    console.log("new resolution: " + width + "x" + height)
    document.getElementById("widthinput").value = width
    document.getElementById("heightinput").value = height
}

async function gen() {
    // Custom res isn't handled by setResolution()
    width = document.getElementById("widthinput").value;
    height = document.getElementById("heightinput").value;
    let widthBytes = new Uint8Array([
        (width >> 24) & 0xff,
        (width >> 16) & 0xff,
        (width >> 8) & 0xff,
        width & 0xff,
    ]);
    let heightBytes = new Uint8Array([
        (height >> 24) & 0xff,
        (height >> 16) & 0xff,
        (height >> 8) & 0xff,
        height & 0xff,
    ]);

    const response = await fetch("./base.ipv");
    const arrayBuffer = await response.arrayBuffer();
    console.log("got base");

    let uint8Array = new Uint8Array(arrayBuffer);

    let targetSequence = [0x00, 0x00, 0x01, 0xE0, 0x00, 0x00, 0x02, 0x80];

    let indices = findAllByteSequences(uint8Array, targetSequence);

    if (indices.length === 0) {
        console.error("no instances found :(");
        return;
    }
    console.log("got indicies " + indices);

    indices.forEach(index => {
        uint8Array.set(heightBytes, index);
        uint8Array.set(widthBytes, index + 4);
        console.log("patched index " + index)
    });

    console.log("create blob and download")
    const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = URL.createObjectURL(blob);
    link.download = 'patched.ipv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}

function findAllByteSequences(array, sequence) {
    let indices = [];
    for (let i = 0; i < array.length - sequence.length + 1; i++) {
        if (sequence.every((byte, j) => array[i + j] === byte)) {
            indices.push(i);
        }
    }
    return indices;
}

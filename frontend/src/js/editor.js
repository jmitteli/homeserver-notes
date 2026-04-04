//Hold the current blocks that are being edited
//Each block is { type, content} - position is determined by array index

let currentBlocks = [];

//---------------Render editor-------------------------

//Renders all blocks in the editor body
const renderEditor = () => {
    const editorBody = document.getElementById('editorBody');
    editorBody.innerHTML = '';

    currentBlocks.forEach((block, index) => {
        const blockElement = createBlockElement(block, index);
        editorBody.appendChild(blockElement);
    });
};


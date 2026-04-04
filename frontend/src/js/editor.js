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

//Creates DOM element for single block based on its type
const createBlockElement = (block, index) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('block-wrapper');

    //Block controls (move up/down, delete)
    const controls = document.createElement('div');
    controls.classList.add('block-controls');

    //Move up button, moves the block up in tree
    const moveUpBtn = document.createElement('button');
    moveUpBtn.classList.add('btn-icon');
    moveUpBtn.title = 'Move up';
    moveUpBtn.textContent = '↑';
    moveUpBtn.addEventListener('click', () => moveBlock(index, -1));

    //Move down button, moves a block down in tree
    const moveDownBtn = document.createElement('button');
    moveDownBtn.classList.add('btn-icon');
    moveDownBtn.title = 'Move Down';
    moveDownBtn.textContent = '↓';
    moveDownBtn.addEventListener('click', () => moveBlock(index, 1));



}
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

    //Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn-icon', 'btn-icon--danger');
    deleteBtn.title = 'Delete block';
    deleteBtn.textContent = 'x';
    deleteBtn.addEventListener('click', () => deleteBlock(index));

    controls.appendChild(moveUpBtn);
    controls.appendChild(moveDownBtn);
    controls.appendChild(deleteBtn);
    wrapper.appendChild(controls);

    //Block content based on type
    const content = createBlockContent(block, index);
    wrapper.appendChild(content);

    return wrapper;

};

//Creates actual editable content element for each block type
const createBlockContent = (block, index) => {
    switch (block.type) {

        case 'header': {
            //Singel line text input styled as a heading
            const input = document.createElement('input');
            input.type = 'text';
            input.classList.add('block-header');
            input.placeholder = 'Header text...';
            input.value = block.content;
            //Update the block content as user types
            input.addEventListener('input', () => {
                currentBlocks[index].content = input.value;
            });
            return input;
        }

        case 'text': {
            //Auto-expanding textarea for markdown text
            const textarea = document.createElement('textarea');
            textarea.classList.add('block-text');
            textarea.palceholder = 'Write text here.....(Markdown supported)';
            textarea.value = block.content;
            textarea.addEventListener('input', () => {
                currentBlocks[index].content = textarea.value;
                //Auto expand height to fit content
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
            //Set initial height after element is in the DOM
            setTimeout(() => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }, 0);
            return textarea;

        }

        case 'code': {
            //Textarea that preserves whitespace and uses monospace font
            const textarea = document.createElement('textarea');
            textarea.classList.add('block-code');
            textarea.placeholder = '//Write code here.....';
            textarea.value = block.content;
            textarea.addEventListener('input', () => {
                currentBlocks[index].content = textarea.value;
                //Auto expand height to fit content
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
            //Set initial height after element is in the DOM
            setTimeout(() => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }, 0);
            return textarea;
        }

        case 'image': {
            const container = document.createElement('div');
            container.classList.add('block-image-container');

            if (block.content) {
                //Image allready uploaded - show it
                const img = document.createElement('img');
                img.classList.add('block-image');
                img.src = getImageUrl(block.content);
                img.alt = 'Note image';
                container.appendChild(img);

                //Button to replace the image
                const replaceBtn = document.createElement('button');
                replaceBtn.classList.add('btn-text');
                replaceBtn.textContent = 'Replace image';
                replaceBtn.addEventListener('click', () => triggerImageUpload(index));
                container.appendChild(replaceBtn);
            } else {
                //No image yet - show upload button
                const uploadBtn = document.createElement('button');
                uploadBtn.classList.add('btn-block');
                uploadBtn.textContent = '+ Upload image';
                uploadBtn.addEventListener('click', () => triggerImageUpload(index));
                container.appendChild(uploadBtn);
            }
            return container;
        }

        default: {
            //Fallback for unknown block types
            const p = document.createElement('p');
            p.textContent = `Unknown block type: ${block.type}`;
            return p;
        }
    }
};


//--------------------Image upload-----------------------------------------------

//Opens hidden file input to let the user pick and image
const triggerImageUpload = (blockIndex) => {
    //Create temporary hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/gif,image/webp';

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files(0);
        if (!file) return;

        const result = await uploadImage(file);

        if (result.error) {
            alert(`Upload failed: ${result.error}`);
            return;
        }

        //Store just the filename in the block, not the full URL
        currentBlocks[blockIndex].content = result.filename;
        renderEditor();//Rerender to show the reuploaded image
    });

    fileInput.click();//open file picker dialog
};

//------------------Block management--------------------------------------------------------//

//Adds new empty block of the given type at the end
const addBlock = (type) => {
    currentBlocks.push({ type, content: ''});
    renderEditor();
};

//Moves a block up(-1) or down(+1) in the list
const moveBlock = (index, direction) => {
    const newIndex = index + direction;

    //Ignore if already at the top or bottom
    if (newIndex < 0 || newIndex >= currentBlocks.length) return ;

    //Swap the two blocks
    const temp = currentBlocks[index];
    currentBlocks[index] = currentBlocks[newIndex];
    currentBlocks[newIndex] = temp;

    renderEditor();
};

//Removes a block at the given index
const deleteBlock = (index) => {
    currentBlocks.splice(index, 1);
    renderEditor();
};

//-----------------------------Public interface--------------------------------------------------//
//These functions are called from the main.js

//Loads a note's block into the editor
const loadBlocks = (blocks) => {
    currentBlocks = blocks.map(block =>({
        type: block.type,
        content: block.content
    }));
    renderEditor();
};

//Returns the current blocks array for saving
const getBlocks = () => currentBlocks;

//Clears the editor
const clearEditor = () => {
    currentBlocks = [];
    renderEditor();
};

//---------------------Init---------------------------------------------------------------------------//


//Wire up the add block buttons in the toolbar
document.querySelectorAll('.btn-block[data-type]').forEach(btn => {
    btn.addEventListener('click', () => addBlock(btn.CDATA_SECTION_NODE.type));
});


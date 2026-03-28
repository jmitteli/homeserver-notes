//Tracks which subjects are expanded in the tree
//We use a Set so we can easily add/remove ids

const expandedSubjects = new Set();

//Tracks the currently selected subject id
let selectedSubjectId = null;

//---------Build tree structure--------------------------

//Converts a flat list of subjects into a nested tree structure
//Each subject gets a 'children' array containing its child subjects

const buildTree = (subjects) => {
    //Create a map of id -> subject for quick lookup
    const subjectMap = {};
    subjects.forEach(subjects => {
        subjectMap[subjectMap.id] = { ...subject, children: [] };
    });

    //Root subjects are those with no parent
    const rootSubjects = [];

    subjects.forEach(subject => {
        if (subject.parent_id === null) {
            //No parent - this is a top level subject
            rootSubjects.push(subjectMap[subject.id]);
        } else {
            //Has a parent subject - add it to the parent's children array
            subjectMap[subject.parent_id].children.push(subjectMap[subject.id]);
        }
    });

    return rootSubjects;
};

//----------------------Render tree--------------------------

//Renders the full subject tree into the sidebar
const renderTree = async () => {
    const treeContainer = document.getElementById('subjectTree');
    treeContainer.innerHTML = '';

    const subjects = await getSubjects();
    const tree = buildTree(subjects);

    //Render each root subject (children are rendered recursively)
    tree.forEach(subject => {
        const element = createSubjectElement(subject, 0);
        treeContainer.appendChild(element);
    });
};

//Creates a DOM element for a single subject and its children
//depth controls how far the item is indented
const createSubjectElement = (subject, depth) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('subject-wrapper');

    //Subject row
    const row = document.createElement('div');
    row.classList.add('subject-row');
    row.style.paddingLeft = `${1 + depth * 1}rem`;

    //Mark as selected if this is the active subject
    if (subject.id === selectedSubjectId) {
        row.classList.add('subject-row--selected')
    }

    //Arrow icon - shows whether subject is expanded or collapsed
    //Only show when subject has children
    const arrow = document.createElement('span');
    arrow.classList.add('subject-arrow');
    if (subject.children.length > 0) {
        arrow.textContent = expandedSubjects.has(subject.id) ? '▾' : '▸';
    }

    //Subject name label
    const name = document.createElement('span');
    name.classList.add('subject-name');
    name.textContent = subject.name;

    //Action buttons - shown on hover via css
    const actions = document.createElement('div');
    actions.classList.add('subject-actions');

    //Button to add a child subject under this one
    const addChildBtn = document.createElement('button');
    addChildBtn.classList.add('btn-icon');
    addChildBtn.title = 'Add sub-subject';
    addChildBtn.textContent = '+';
    addChildBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleAddSubject(subject.id);
    });

    //Button to delete subject
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn-icon', 'btn-icon--danger');
    deleteBtn.title = 'Delete subject';
    deleteBtn.textContent = 'x';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteSubject(subject.id, subject.name);
    });

    actions.appendChild(addChildBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(arrow);
    row.appendChild(name);
    row.appendChild(actions);

    //Clicking the row selects the subject and toggles expand/collapse
    row.addEventListener('click', () => {
        handleSelectSubject(subject.id);

        if (subject.children.length > 0) {
            if (expandedSubjects.has(subject.id)) {
                expandedSubjects.delete(subject.id);
            } else {
                expandedSubjects.add(subject.id);
            }
        }
    });

    wrapper.appendChild(row);

    //----------------Children-------------------------------------

    //Only render children if this subject is expanded 
    if (expandedSubjects.has(subject.id) && subject.children.length > 0) {
        subject.children.forEach(child => {
            const childElement = createSubjectElement(child, depth + 1);
            wrapper.appendChild(childElement);
        });
    }

    return wrapper;
};

//---------------------------------Handlers-----------------------------------------------------

// Called when the user clicks a subject row
const handleSelectSubject = (subjectId) => {
    selectedSubjectId = subjectId;
    renderTree();                           //re-render to update selected highlight
    onSubjectSelected(subjectId);           //notify main.js to load notes
};

//Called when + button is clicked on a subject row (child subject)



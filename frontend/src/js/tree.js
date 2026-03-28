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
        subjectMap[subjectMap.id] = { ...subject, children: []};
    });

    //Root subjects are those with no parent
    const rootSubjects = [];

    subjects.forEach(subject => {
        if (subject.parent_id === null){
            //No parent - this is a top level subject
            rootSubjects.push(subjectMap[subject.id]);
        }else{
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



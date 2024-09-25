document.addEventListener('DOMContentLoaded', () => {
    loadAssumptions();
    showPage('dynamic');
});

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function saveAssumptions() {
    const assumptions = {
        manhours: parseFloat(document.getElementById('manhours').value) || 0,
        consultantTime: parseFloat(document.getElementById('consultantTime').value) / 100 || 0,
        registrarTime: parseFloat(document.getElementById('registrarTime').value) / 100 || 0,
        simpleCTTime: parseFloat(document.getElementById('simpleCTTime').value) || 0,
        complexCTTime: parseFloat(document.getElementById('complexCTTime').value) || 0,
        complexCTWork: parseFloat(document.getElementById('complexCTWork').value) / 100 || 0,
        simpleMRITime: parseFloat(document.getElementById('simpleMRITime').value) || 0,
        complexMRITime: parseFloat(document.getElementById('complexMRITime').value) || 0,
        complexMRIWork: parseFloat(document.getElementById('complexMRIWork').value) / 100 || 0,
        seasonalAdjustment: parseFloat(document.getElementById('seasonalAdjustment').value) / 100 || 0
    };
    localStorage.setItem('assumptions', JSON.stringify(assumptions));
    alert('Assumptions saved successfully!');
}

function loadAssumptions() {
    let assumptions = JSON.parse(localStorage.getItem('assumptions'));
    if (!assumptions) {
        // Default assumptions if none are saved
        assumptions = {
            manhours: 200,
            consultantTime: 0.8,
            registrarTime: 0.5,
            simpleCTTime: 30,
            complexCTTime: 120,
            complexCTWork: 0.2,
            simpleMRITime: 40,
            complexMRITime: 150,
            complexMRIWork: 0.25,
            seasonalAdjustment: 0.8
        };
        // Save default assumptions to localStorage
        localStorage.setItem('assumptions', JSON.stringify(assumptions));
    }

    // Fill in the form with the loaded or default assumptions
    document.getElementById('manhours').value = assumptions.manhours;
    document.getElementById('consultantTime').value = assumptions.consultantTime * 100;
    document.getElementById('registrarTime').value = assumptions.registrarTime * 100;
    document.getElementById('simpleCTTime').value = assumptions.simpleCTTime;
    document.getElementById('complexCTTime').value = assumptions.complexCTTime;
    document.getElementById('complexCTWork').value = assumptions.complexCTWork * 100;
    document.getElementById('simpleMRITime').value = assumptions.simpleMRITime;
    document.getElementById('complexMRITime').value = assumptions.complexMRITime;
    document.getElementById('complexMRIWork').value = assumptions.complexMRIWork * 100;
    document.getElementById('seasonalAdjustment').value = assumptions.seasonalAdjustment * 100;
}

function calculateManpower() {
    const assumptions = {
        manhours: parseFloat(document.getElementById('manhours').value) || 0,
        consultantTime: parseFloat(document.getElementById('consultantTime').value) / 100 || 0,
        registrarTime: parseFloat(document.getElementById('registrarTime').value) / 100 || 0,
        simpleCTTime: parseFloat(document.getElementById('simpleCTTime').value) || 0,
        complexCTTime: parseFloat(document.getElementById('complexCTTime').value) || 0,
        complexCTWork: parseFloat(document.getElementById('complexCTWork').value) / 100 || 0,
        simpleMRITime: parseFloat(document.getElementById('simpleMRITime').value) || 0,
        complexMRITime: parseFloat(document.getElementById('complexMRITime').value) || 0,
        complexMRIWork: parseFloat(document.getElementById('complexMRIWork').value) / 100 || 0,
        seasonalAdjustment: parseFloat(document.getElementById('seasonalAdjustment').value) / 100 || 0
    };

    const consultants = parseFloat(document.getElementById('consultants').value) || 0;
    const registrars = parseFloat(document.getElementById('registrars').value) || 0;
    const ctPatients = parseFloat(document.getElementById('ctPatients').value) || 0;
    const mriPatients = parseFloat(document.getElementById('mriPatients').value) || 0;

    const totalAvailableManhours = (consultants * assumptions.consultantTime * assumptions.manhours) + (registrars * assumptions.registrarTime * assumptions.manhours);
    const timeSimpleCT = (ctPatients * assumptions.simpleCTTime * (1 - assumptions.complexCTWork)) / 60;
    const timeComplexCT = (ctPatients * assumptions.complexCTTime * assumptions.complexCTWork) / 60;
    const timeSimpleMRI = (mriPatients * assumptions.simpleMRITime * (1 - assumptions.complexMRIWork)) / 60;
    const timeComplexMRI = (mriPatients * assumptions.complexMRITime * assumptions.complexMRIWork) / 60;
    const totalTimeCT = timeSimpleCT + timeComplexCT;
    const totalTimeMRI = timeSimpleMRI + timeComplexMRI;
    const totalTimeReporting = totalTimeCT + totalTimeMRI;
    // Corrected formula:
    const adjustedTotalTimeReporting = totalTimeReporting * assumptions.seasonalAdjustment;
    const totalDeficitSurplusManhours = totalAvailableManhours - adjustedTotalTimeReporting;
    const totalDeficitSurplusManpower = totalDeficitSurplusManhours / assumptions.manhours;

    document.getElementById('result').innerHTML = `
        <h2>Results</h2>
        <p>Total available manhours per month: ${totalAvailableManhours.toFixed(2)}</p>
        <p>Time required for simple CT reporting: ${timeSimpleCT.toFixed(2)}</p>
        <p>Time required for complex CT reporting: ${timeComplexCT.toFixed(2)}</p>
        <p>Total time required for CT per month: ${totalTimeCT.toFixed(2)}</p>
        <p>Time required for simple MRI reporting: ${timeSimpleMRI.toFixed(2)}</p>
        <p>Time required for complex MRI reporting: ${timeComplexMRI.toFixed(2)}</p>
        <p>Total time required for MRI per month: ${totalTimeMRI.toFixed(2)}</p>
        <p>Total time required for reporting per month: ${totalTimeReporting.toFixed(2)}</p>
        <p>Adjusted total time required for reporting per month: ${adjustedTotalTimeReporting.toFixed(2)}</p>
        <p>Total deficit or surplus of manhours per month: ${totalDeficitSurplusManhours.toFixed(2)}</p>
        <p>Total deficit or surplus manpower required: ${totalDeficitSurplusManpower.toFixed(2)}</p>
    `;
}
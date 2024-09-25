document.addEventListener('DOMContentLoaded', () => {
    loadAssumptions();
    showPage('dynamic');
});

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`nav ul li a[onclick="showPage('${pageId}')"]`).classList.add('active');
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

function showAdditionalInput(show) {
    document.getElementById('additionalRegistrarsInput').style.display = show ? 'block' : 'none';
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

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Results</h2>
        <p class="${totalDeficitSurplusManhours >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold">
            Total deficit or surplus of manhours per month: ${totalDeficitSurplusManhours.toFixed(2)}
        </p>
        <p class="${totalDeficitSurplusManpower >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold">
            Total deficit or surplus manpower required: ${totalDeficitSurplusManpower.toFixed(2)}
        </p>
    `;

    const deficitOptionsDiv = document.getElementById('deficit-options');
    if (totalDeficitSurplusManhours < 0) {
        deficitOptionsDiv.style.display = 'block';
    } else {
        deficitOptionsDiv.style.display = 'none';
    }

    const hireOption = document.querySelector('input[name="hireOption"]:checked');
    if (hireOption) {
        let additionalRegistrars = 0;
        let additionalDoctors = 0;
        if (hireOption.value === 'registrars') {
            additionalRegistrars = Math.abs(totalDeficitSurplusManhours) / (assumptions.registrarTime * assumptions.manhours);
            resultDiv.innerHTML += `<p class="additional-result">Additional registrars required: ${additionalRegistrars.toFixed(1)}</p>`;
        } else if (hireOption.value === 'doctors') {
            additionalDoctors = Math.abs(totalDeficitSurplusManhours) / (assumptions.consultantTime * assumptions.manhours);
            resultDiv.innerHTML += `<p class="additional-result">Additional doctors required: ${additionalDoctors.toFixed(1)}</p>`;
        } else if (hireOption.value === 'mix') {
            const additionalRegistrarsInput = parseFloat(document.getElementById('additionalRegistrars').value) || 0;
            const remainingManhours = Math.abs(totalDeficitSurplusManhours) - (additionalRegistrarsInput * assumptions.registrarTime * assumptions.manhours);
            additionalDoctors = remainingManhours / (assumptions.consultantTime * assumptions.manhours);
            resultDiv.innerHTML += `<p class="additional-result">Additional registrars required: ${additionalRegistrarsInput.toFixed(1)}</p>`;
            resultDiv.innerHTML += `<p class="additional-result">Additional doctors required: ${additionalDoctors.toFixed(1)}</p>`;
        }
    }
}

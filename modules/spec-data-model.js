// =====================================================
// MODELO CENTRAL DE DATOS SPEC
// =====================================================

function buildSpecData() {
    const generalData = {
        customer: document.getElementById('customer')?.value || '',
        style: document.getElementById('style')?.value || '',
        folder: document.getElementById('folder-num')?.value || '',
        colorway: document.getElementById('colorway')?.value || '',
        season: document.getElementById('season')?.value || '',
        pattern: document.getElementById('pattern')?.value || '',
        po: document.getElementById('po')?.value || '',
        sampleType: document.getElementById('sample-type')?.value || '',
        nameTeam: document.getElementById('name-team')?.value || '',
        gender: document.getElementById('gender')?.value || '',
        designer: document.getElementById('designer')?.value || '',
        baseSize: document.getElementById('base-size')?.value || '',
        fabric: document.getElementById('fabric')?.value || '',
        technicianName: document.getElementById('technician-name')?.value || '',
        technicalComments: document.getElementById('technical-comments')?.value || '',
        savedAt: new Date().toISOString()
    };

    // 'placements' es una variable global
    const placementsData = (typeof placements !== 'undefined' ? placements : []).map(placement => {
        const specialtiesField = document.getElementById(`specialties-${placement.id}`);
        const instructionsField = document.getElementById(`special-instructions-${placement.id}`);
        
        return {
            id: placement.id,
            type: placement.type,
            name: placement.name,
            imageData: placement.imageData,
            colors: (placement.colors || []).map(c => ({
                id: c.id,
                type: c.type,
                val: c.val,
                screenLetter: c.screenLetter,
                mesh: c.mesh || '',
                additives: c.additives || ''
            })),
            sequence: placement.sequence || [],
            placementDetails: placement.placementDetails,
            dimensions: placement.dimensions,
            width: placement.width,
            height: placement.height,
            temp: placement.temp,
            time: placement.time,
            specialties: specialtiesField ? specialtiesField.value : placement.specialties,
            specialInstructions: instructionsField ? instructionsField.value : placement.specialInstructions,
            inkType: placement.inkType,
            placementSelect: placement.placementSelect,
            meshColor: placement.meshColor,
            meshWhite: placement.meshWhite,
            meshBlocker: placement.meshBlocker,
            durometer: placement.durometer,
            strokes: placement.strokes,
            angle: placement.angle,
            pressure: placement.pressure,
            speed: placement.speed,
            additives: placement.additives
        };
    });

    return {
        ...generalData,
        placements: placementsData
    };
}

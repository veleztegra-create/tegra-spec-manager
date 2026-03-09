// placement-color-dnd.js
// Encapsula la lógica de drag & drop para reordenar colores de placements
(function () {
  function createPlacementColorDndManager(deps) {
    const {
      getPlacementById,
      syncPlacementSequenceWithColors,
      renderPlacementColors,
      updatePlacementStations,
      updatePlacementColorsPreview,
      checkForSpecialtiesInColors,
      showStatus
    } = deps;

    let draggedColorContext = null;

    function moveByIndex(placementId, fromIndex, toIndex) {
      const placement = getPlacementById(placementId);
      if (!placement || !Array.isArray(placement.colors)) return;
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= placement.colors.length || toIndex >= placement.colors.length) return;

      const [moved] = placement.colors.splice(fromIndex, 1);
      placement.colors.splice(toIndex, 0, moved);

      syncPlacementSequenceWithColors(placement, true);
      renderPlacementColors(placementId);
      updatePlacementStations(placementId);
      updatePlacementColorsPreview(placementId);
      checkForSpecialtiesInColors(placementId);
    }

    function onDragStart(event) {
      const target = event.target.closest('.color-item');
      if (!target) return;

      const isFromHandle = !!event.target.closest('.drag-handle') || target.dataset.dragArmed === '1';
      if (!isFromHandle) {
        event.preventDefault();
        return;
      }

      const fromPlacementId = Number(target.dataset.placementId);
      const fromColorId = target.dataset.colorId;
      if (!fromPlacementId || !fromColorId) return;

      draggedColorContext = {
        placementId: fromPlacementId,
        colorId: fromColorId
      };

      target.classList.add('dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', fromColorId);
      }
    }

    function onDragOver(event) {
      const target = event.target.closest('.color-item');
      if (!target || !draggedColorContext) return;
      if (Number(target.dataset.placementId) !== draggedColorContext.placementId) return;

      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    }

    function onDrop(event) {
      const target = event.target.closest('.color-item');
      if (!target || !draggedColorContext) return;

      const placementId = Number(target.dataset.placementId);
      if (placementId !== draggedColorContext.placementId) return;

      const placement = getPlacementById(placementId);
      if (!placement || !Array.isArray(placement.colors)) return;

      event.preventDefault();

      const fromIndex = placement.colors.findIndex((c) => String(c.id) === draggedColorContext.colorId);
      const toIndex = placement.colors.findIndex((c) => String(c.id) === String(target.dataset.colorId));
      moveByIndex(placementId, fromIndex, toIndex);
      showStatus('↕️ Secuencia de colores actualizada');
    }

    function onDragEnd() {
      document.querySelectorAll('.color-item.dragging').forEach((item) => {
        item.classList.remove('dragging');
        delete item.dataset.dragArmed;
      });
      draggedColorContext = null;
    }

    function bindColorItem(colorItemEl) {
      const dragHandle = colorItemEl.querySelector('.drag-handle');
      if (dragHandle) {
        dragHandle.addEventListener('mousedown', () => {
          colorItemEl.dataset.dragArmed = '1';
        });
        dragHandle.addEventListener('mouseup', () => {
          delete colorItemEl.dataset.dragArmed;
        });
        dragHandle.addEventListener('mouseleave', () => {
          delete colorItemEl.dataset.dragArmed;
        });
      }

      colorItemEl.addEventListener('dragstart', onDragStart);
      colorItemEl.addEventListener('dragover', onDragOver);
      colorItemEl.addEventListener('drop', onDrop);
      colorItemEl.addEventListener('dragend', onDragEnd);
    }

    return {
      bindColorItem,
      moveByIndex
    };
  }

  window.PlacementColorDnD = {
    createPlacementColorDndManager
  };
})();

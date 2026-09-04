window.v4ObjectTableScript = `
(function() {
    console.log("[V4 Object Table] Module initialized.");
    window.v4MessageHandlers = window.v4MessageHandlers || {};

    window.v4MessageHandlers['LF_UPDATE_CELL_STYLE'] = function(d) {
        if (window.TableManager) {
            window.TableManager.updateSelectedCellsStyle(d.style);
        }
    };

    window.v4MessageHandlers['LF_UPDATE_CELL_DIMENSION'] = function(d) {
        if (window.TableManager) {
            if (d.width !== undefined) {
                window.TableManager.updateSelectedColumnWidth(d.width);
            }
            if (d.height !== undefined) {
                window.TableManager.updateSelectedRowHeight(d.height);
            }
            if (typeof window.markDirty === 'function') window.markDirty();
            if (typeof window.syncTableComponentSize === 'function') {
                setTimeout(window.syncTableComponentSize, 50);
            }
        }
    };

    window.v4MessageHandlers['LF_UPDATE_CELL_BORDER'] = function(d) {
        if (window.TableManager && window.TableManager.updateSelectedCellsBorder) {
            window.TableManager.updateSelectedCellsBorder(d.borderType, d.color);
        }
    };
})();
`;

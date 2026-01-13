/**
 * Anotador - Aplicación JavaScript
 * Un anotador web minimalista sin distracciones
 */

(function() {
    'use strict';

    // ================================
    // ELEMENTOS DEL DOM
    // ================================
    const elements = {
        body: document.body,
        editor: document.querySelector('.editor'),
        settingsTrigger: document.getElementById('settingsTrigger'),
        settingsPanel: document.getElementById('settingsPanel'),
        themeButtons: document.querySelectorAll('[data-theme]'),
        resetBtn: document.getElementById('resetBtn'),
        formatBar: document.getElementById('formatBar'),
        boldBtn: document.getElementById('boldBtn'),
        italicBtn: document.getElementById('italicBtn'),
        increaseFontBtn: document.getElementById('increaseFontBtn'),
        decreaseFontBtn: document.getElementById('decreaseFontBtn'),
        resetFormatBtn: document.getElementById('resetFormatBtn')
    };

    // ================================
    // ESTADO DE LA APLICACIÓN
    // ================================
    const state = {
        currentTheme: 'light',
        isPanelOpen: false,
        mouseInRightCorner: false,
        mouseInLeftCorner: false,
        savedSelection: null
    };

    // ================================
    // CONFIGURACIÓN DE FUENTE
    // ================================
    const FONT_CONFIG = {
        baseSize: 1.1,    // rem - tamaño base
        minSize: 0.7,     // rem
        maxSize: 2.5,     // rem
        step: 0.15        // rem
    };

    // ================================
    // ZONAS DE DETECCIÓN DEL MOUSE
    // ================================
    const CORNER_ZONE = {
        width: 150,
        height: 150
    };

    // ================================
    // FUNCIONES DE TEMA
    // ================================
    
    function setTheme(theme) {
        state.currentTheme = theme;
        elements.body.setAttribute('data-theme', theme);
        
        elements.themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // ================================
    // FUNCIONES DE SELECCIÓN
    // ================================

    /**
     * Guarda la selección actual
     */
    function saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            state.savedSelection = selection.getRangeAt(0).cloneRange();
        }
    }

    /**
     * Restaura la selección guardada
     */
    function restoreSelection() {
        if (state.savedSelection) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(state.savedSelection);
        }
    }

    /**
     * Verifica si hay texto seleccionado
     */
    function hasSelection() {
        const selection = window.getSelection();
        return selection && !selection.isCollapsed && selection.toString().trim().length > 0;
    }

    // ================================
    // FUNCIONES DE FORMATO DE TEXTO
    // ================================
    
    /**
     * Aplica o quita negrita al texto seleccionado
     */
    function toggleBold() {
        restoreSelection();
        document.execCommand('bold', false, null);
        updateFormatButtonStates();
        elements.editor.focus();
    }

    /**
     * Aplica o quita cursiva al texto seleccionado
     */
    function toggleItalic() {
        restoreSelection();
        document.execCommand('italic', false, null);
        updateFormatButtonStates();
        elements.editor.focus();
    }

    /**
     * Obtiene el tamaño de fuente actual de un elemento en rem
     */
    function getFontSizeInRem(element) {
        const computedSize = window.getComputedStyle(element).fontSize;
        const pxSize = parseFloat(computedSize);
        const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        return pxSize / rootFontSize;
    }

    /**
     * Aumenta el tamaño de la fuente del texto seleccionado
     */
    function increaseFontSize() {
        restoreSelection();
        if (!hasSelection()) {
            elements.editor.focus();
            return;
        }
        changeFontSize(FONT_CONFIG.step);
        elements.editor.focus();
    }

    /**
     * Reduce el tamaño de la fuente del texto seleccionado
     */
    function decreaseFontSize() {
        restoreSelection();
        if (!hasSelection()) {
            elements.editor.focus();
            return;
        }
        changeFontSize(-FONT_CONFIG.step);
        elements.editor.focus();
    }

    /**
     * Cambia el tamaño de fuente del texto seleccionado
     */
    function changeFontSize(delta) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        
        // Obtener el tamaño actual basado en el nodo de inicio
        let currentNode = range.startContainer;
        if (currentNode.nodeType === Node.TEXT_NODE) {
            currentNode = currentNode.parentNode;
        }
        
        const currentSizeRem = getFontSizeInRem(currentNode);
        let newSize = currentSizeRem + delta;
        
        // Limitar el tamaño
        newSize = Math.max(FONT_CONFIG.minSize, Math.min(FONT_CONFIG.maxSize, newSize));
        
        // Crear span con el nuevo tamaño
        const span = document.createElement('span');
        span.style.fontSize = newSize.toFixed(2) + 'rem';
        
        try {
            span.appendChild(range.extractContents());
            range.insertNode(span);
            
            // Limpiar spans anidados con font-size
            cleanupNestedFontSizes(span);
            
            // Seleccionar el nuevo contenido
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            selection.addRange(newRange);
            saveSelection();
        } catch (e) {
            console.warn('No se pudo cambiar el tamaño:', e);
        }
    }

    /**
     * Limpia spans anidados que tengan font-size
     */
    function cleanupNestedFontSizes(container) {
        const spans = container.querySelectorAll('span[style*="font-size"]');
        spans.forEach(span => {
            // Quitar el font-size del span anidado
            span.style.fontSize = '';
            // Si el span quedó sin estilos, desenvolverlo
            if (!span.getAttribute('style') || span.getAttribute('style').trim() === '') {
                while (span.firstChild) {
                    span.parentNode.insertBefore(span.firstChild, span);
                }
                span.parentNode.removeChild(span);
            }
        });
    }

    /**
     * Restablece el formato del texto seleccionado (quita negrita, cursiva y tamaño personalizado)
     */
    function resetFormat() {
        restoreSelection();
        
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            elements.editor.focus();
            return;
        }

        // Guardar el texto plano antes de cualquier modificación
        const plainText = selection.toString();
        
        if (!plainText) {
            elements.editor.focus();
            return;
        }

        // Método 1: Usar removeFormat del navegador (quita bold, italic, etc.)
        document.execCommand('removeFormat', false, null);
        
        // Método 2: Adicionalmente, quitar cualquier estilo inline de font-size
        // Volver a obtener la selección después de removeFormat
        const newSelection = window.getSelection();
        if (newSelection && newSelection.rangeCount > 0) {
            const range = newSelection.getRangeAt(0);
            
            // Si la selección está dentro de un span con font-size, limpiarlo
            let container = range.commonAncestorContainer;
            if (container.nodeType === Node.TEXT_NODE) {
                container = container.parentNode;
            }
            
            // Buscar spans con font-size en el contenedor y limpiarlos
            if (container && container !== elements.editor) {
                const parent = container.closest('span[style*="font-size"]');
                if (parent && elements.editor.contains(parent)) {
                    // Quitar el font-size
                    parent.style.fontSize = '';
                    // Si el span quedó sin estilos útiles, desenvolverlo
                    unwrapEmptySpan(parent);
                }
            }
            
            // También buscar spans con font-size dentro de la selección
            cleanupFontSizeInRange(range);
        }
        
        saveSelection();
        updateFormatButtonStates();
        elements.editor.focus();
    }

    /**
     * Desenvuelve un span si no tiene estilos útiles
     */
    function unwrapEmptySpan(span) {
        if (!span || span.tagName !== 'SPAN') return;
        
        const style = span.getAttribute('style');
        if (!style || style.trim() === '' || style.trim() === ';') {
            const parent = span.parentNode;
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
            }
            parent.removeChild(span);
        }
    }

    /**
     * Limpia los font-size de spans dentro de un rango
     */
    function cleanupFontSizeInRange(range) {
        // Obtener todos los nodos dentro del rango
        const container = range.commonAncestorContainer;
        let searchRoot = container;
        
        if (container.nodeType === Node.TEXT_NODE) {
            searchRoot = container.parentNode;
        }
        
        if (!searchRoot || !elements.editor.contains(searchRoot)) return;
        
        // Buscar todos los spans con font-size
        const spans = searchRoot.querySelectorAll ? 
            searchRoot.querySelectorAll('span[style*="font-size"]') : [];
        
        spans.forEach(span => {
            // Verificar si el span está dentro de la selección (aproximación)
            if (range.intersectsNode(span)) {
                span.style.fontSize = '';
                unwrapEmptySpan(span);
            }
        });
    }

    /**
     * Actualiza el estado visual de los botones de formato
     */
    function updateFormatButtonStates() {
        elements.boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        elements.italicBtn.classList.toggle('active', document.queryCommandState('italic'));
    }

    // ================================
    // FUNCIONES DEL PANEL DE AJUSTES
    // ================================
    
    function openPanel() {
        state.isPanelOpen = true;
        elements.settingsPanel.classList.add('open');
        elements.settingsTrigger.classList.add('active');
    }

    function closePanel() {
        state.isPanelOpen = false;
        elements.settingsPanel.classList.remove('open');
        elements.settingsTrigger.classList.remove('active');
    }

    function togglePanel() {
        if (state.isPanelOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    // ================================
    // FUNCIONES DE VISIBILIDAD
    // ================================
    
    function isInRightCornerZone(event) {
        const viewportWidth = window.innerWidth;
        return (
            event.clientX >= viewportWidth - CORNER_ZONE.width &&
            event.clientY <= CORNER_ZONE.height
        );
    }

    function isInLeftCornerZone(event) {
        return (
            event.clientX <= CORNER_ZONE.width &&
            event.clientY <= CORNER_ZONE.height
        );
    }

    function showSettingsTrigger() {
        state.mouseInRightCorner = true;
        elements.settingsTrigger.classList.add('visible');
    }

    function hideSettingsTrigger() {
        state.mouseInRightCorner = false;
        if (!state.isPanelOpen) {
            elements.settingsTrigger.classList.remove('visible');
        }
    }

    function showFormatBar() {
        state.mouseInLeftCorner = true;
        elements.formatBar.classList.add('visible');
    }

    function hideFormatBar() {
        state.mouseInLeftCorner = false;
        elements.formatBar.classList.remove('visible');
    }

    // ================================
    // FUNCIÓN DE REINICIO DE HOJA
    // ================================
    
    function resetEditor() {
        if (elements.editor.innerHTML.trim() === '') {
            return;
        }

        elements.editor.innerHTML = '';
        closePanel();
        elements.editor.focus();
    }

    // ================================
    // EVENT LISTENERS
    // ================================
    
    function initEventListeners() {
        // Movimiento del mouse para mostrar/ocultar elementos
        document.addEventListener('mousemove', (event) => {
            // Esquina superior derecha - ajustes
            if (isInRightCornerZone(event)) {
                if (!state.mouseInRightCorner) {
                    showSettingsTrigger();
                }
            } else {
                if (state.mouseInRightCorner && !state.isPanelOpen) {
                    hideSettingsTrigger();
                }
            }

            // Esquina superior izquierda - barra de formato
            if (isInLeftCornerZone(event)) {
                if (!state.mouseInLeftCorner) {
                    showFormatBar();
                }
            } else {
                if (state.mouseInLeftCorner) {
                    const barRect = elements.formatBar.getBoundingClientRect();
                    const isOverBar = (
                        event.clientX >= barRect.left &&
                        event.clientX <= barRect.right &&
                        event.clientY >= barRect.top &&
                        event.clientY <= barRect.bottom
                    );
                    if (!isOverBar) {
                        hideFormatBar();
                    }
                }
            }
        });

        // Guardar selección cuando se hace mousedown en la barra de formato
        elements.formatBar.addEventListener('mousedown', (event) => {
            event.preventDefault(); // Prevenir que se pierda la selección
            saveSelection();
        });

        // Click en el trigger de ajustes
        elements.settingsTrigger.addEventListener('click', (event) => {
            event.stopPropagation();
            togglePanel();
        });

        // Clicks en botones de tema
        elements.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setTheme(btn.dataset.theme);
            });
        });

        // Botones de formato
        elements.boldBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleBold();
        });

        elements.italicBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleItalic();
        });

        elements.increaseFontBtn.addEventListener('click', (event) => {
            event.preventDefault();
            increaseFontSize();
        });

        elements.decreaseFontBtn.addEventListener('click', (event) => {
            event.preventDefault();
            decreaseFontSize();
        });

        elements.resetFormatBtn.addEventListener('click', (event) => {
            event.preventDefault();
            resetFormat();
        });

        // Atajos de teclado
        document.addEventListener('keydown', (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
                event.preventDefault();
                toggleBold();
            }
            if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
                event.preventDefault();
                toggleItalic();
            }
            if ((event.metaKey || event.ctrlKey) && (event.key === '+' || event.key === '=')) {
                event.preventDefault();
                increaseFontSize();
            }
            if ((event.metaKey || event.ctrlKey) && event.key === '-') {
                event.preventDefault();
                decreaseFontSize();
            }
            if (event.key === 'Escape' && state.isPanelOpen) {
                closePanel();
            }
        });

        // Actualizar estado de botones cuando cambia la selección
        document.addEventListener('selectionchange', () => {
            updateFormatButtonStates();
        });

        // Click en botón de reiniciar hoja
        elements.resetBtn.addEventListener('click', resetEditor);

        // Cerrar panel al hacer click fuera
        document.addEventListener('click', (event) => {
            if (state.isPanelOpen) {
                const isClickInsidePanel = elements.settingsPanel.contains(event.target);
                const isClickOnTrigger = elements.settingsTrigger.contains(event.target);
                
                if (!isClickInsidePanel && !isClickOnTrigger) {
                    closePanel();
                    if (!state.mouseInRightCorner) {
                        hideSettingsTrigger();
                    }
                }
            }
        });

        // Prevenir pérdida de contenido al salir
        window.addEventListener('beforeunload', (event) => {
            if (elements.editor.innerHTML.trim() !== '') {
                event.preventDefault();
                event.returnValue = '';
            }
        });

        // Enfocar editor al cargar
        elements.editor.focus();
    }

    // ================================
    // INICIALIZACIÓN
    // ================================
    
    function init() {
        const criticalElements = [
            'body', 'editor', 'settingsTrigger', 'settingsPanel', 
            'resetBtn', 'formatBar', 'boldBtn', 'italicBtn',
            'increaseFontBtn', 'decreaseFontBtn', 'resetFormatBtn'
        ];
        const missing = criticalElements.filter(key => !elements[key]);
        
        if (missing.length > 0) {
            console.error('Elementos faltantes:', missing);
            return;
        }

        state.currentTheme = elements.body.dataset.theme || 'light';
        initEventListeners();
        console.log('🖊️ Anotador iniciado');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

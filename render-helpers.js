// render-helpers.js
class RenderHelpers {
    // Crear elemento DOM con atributos
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Establecer atributos
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('on')) {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        }
        
        // Agregar hijos
        if (Array.isArray(children)) {
            children.forEach(child => {
                if (child instanceof Node) {
                    element.appendChild(child);
                } else if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                }
            });
        } else if (children instanceof Node) {
            element.appendChild(children);
        } else if (typeof children === 'string') {
            element.textContent = children;
        }
        
        return element;
    }
    
    // Crear card
    static createCard(title, content, options = {}) {
        const { headerClass = '', bodyClass = '', actions = [] } = options;
        
        const card = this.createElement('div', {
            className: 'card'
        });
        
        // Header
        const header = this.createElement('div', {
            className: `card-header ${headerClass}`
        }, [
            this.createElement('h2', {
                className: 'card-title',
                innerHTML: title
            })
        ]);
        
        // Acciones en header si existen
        if (actions.length > 0) {
            const actionsContainer = this.createElement('div', {
                className: 'no-print'
            });
            
            actions.forEach(action => {
                const button = this.createElement('button', {
                    className: `btn ${action.class || 'btn-sm'}`,
                    innerHTML: action.html || action.text || '',
                    onclick: action.onclick
                });
                actionsContainer.appendChild(button);
            });
            
            header.appendChild(actionsContainer);
        }
        
        // Body
        const body = this.createElement('div', {
            className: `card-body ${bodyClass}`,
            innerHTML: content
        });
        
        card.appendChild(header);
        card.appendChild(body);
        
        return card;
    }
    
    // Crear tabla
    static createTable(headers, rows, options = {}) {
        const { className = 'sequence-table', id = '' } = options;
        
        const table = this.createElement('table', {
            className,
            id
        });
        
        // Encabezados
        const thead = this.createElement('thead');
        const headerRow = this.createElement('tr');
        
        headers.forEach(header => {
            headerRow.appendChild(
                this.createElement('th', {
                    textContent: header
                })
            );
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Cuerpo
        const tbody = this.createElement('tbody');
        
        rows.forEach((row, rowIndex) => {
            const tr = this.createElement('tr', {
                className: rowIndex % 2 === 0 ? 'even' : 'odd'
            });
            
            row.forEach(cell => {
                tr.appendChild(
                    this.createElement('td', {
                        textContent: cell
                    })
                );
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        return table;
    }
    
    // Crear formulario con campos
    static createForm(fields, options = {}) {
        const { 
            className = 'form-grid', 
            onSubmit = null,
            submitText = 'Guardar'
        } = options;
        
        const form = this.createElement('form', {
            className
        });
        
        fields.forEach(field => {
            const formGroup = this.createElement('div', {
                className: 'form-group'
            });
            
            // Label
            if (field.label) {
                formGroup.appendChild(
                    this.createElement('label', {
                        className: 'form-label',
                        textContent: field.label,
                        htmlFor: field.id
                    })
                );
            }
            
            // Input/Select/Textarea
            let input;
            if (field.type === 'select') {
                input = this.createElement('select', {
                    id: field.id,
                    className: 'form-control',
                    name: field.name || field.id
                });
                
                if (field.options) {
                    field.options.forEach(option => {
                        const optionEl = this.createElement('option', {
                            value: option.value,
                            textContent: option.text,
                            selected: option.selected || false
                        });
                        input.appendChild(optionEl);
                    });
                }
            } else if (field.type === 'textarea') {
                input = this.createElement('textarea', {
                    id: field.id,
                    className: 'form-control',
                    name: field.name || field.id,
                    rows: field.rows || 3,
                    placeholder: field.placeholder || ''
                });
            } else {
                input = this.createElement('input', {
                    type: field.type || 'text',
                    id: field.id,
                    className: 'form-control',
                    name: field.name || field.id,
                    placeholder: field.placeholder || '',
                    value: field.value || ''
                });
            }
            
            formGroup.appendChild(input);
            form.appendChild(formGroup);
        });
        
        // Botón de submit si se especificó
        if (onSubmit) {
            const submitButton = this.createElement('button', {
                type: 'button',
                className: 'btn btn-primary',
                textContent: submitText,
                onclick: (e) => {
                    e.preventDefault();
                    onSubmit(form);
                }
            });
            
            form.appendChild(submitButton);
        }
        
        return form;
    }
    
    // Crear badge
    static createBadge(text, type = 'default') {
        const typeClasses = {
            'default': 'badge-color',
            'primary': 'badge-color',
            'success': 'badge-success',
            'warning': 'badge-warning',
            'danger': 'badge-danger',
            'info': 'badge-info',
            'blocker': 'badge-blocker',
            'white': 'badge-white'
        };
        
        return this.createElement('span', {
            className: `badge ${typeClasses[type] || 'badge-color'}`,
            textContent: text
        });
    }
    
    // Crear preview de color
    static createColorPreview(color, size = 35) {
        const preview = this.createElement('div', {
            className: 'color-preview',
            style: {
                width: `${size}px`,
                height: `${size}px`
            },
            title: color || 'Color no especificado'
        });
        
        const colorHex = Utils.getColorHex(color);
        if (colorHex) {
            preview.style.background = colorHex;
            preview.style.backgroundImage = 'none';
        } else if (color) {
            const randomColor = Utils.stringToColor(color);
            preview.style.background = randomColor;
        }
        
        return preview;
    }
    
    // Crear modal
    static createModal(title, content, options = {}) {
        const { 
            id = `modal-${Date.now()}`,
            size = 'medium', // small, medium, large
            buttons = []
        } = options;
        
        const sizeClasses = {
            'small': 'modal-sm',
            'medium': '',
            'large': 'modal-lg'
        };
        
        // Crear overlay
        const overlay = this.createElement('div', {
            className: 'modal-overlay',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000'
            },
            onclick: (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            }
        });
        
        // Crear modal
        const modal = this.createElement('div', {
            className: `modal ${sizeClasses[size]}`,
            style: {
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                maxWidth: size === 'small' ? '400px' : size === 'large' ? '800px' : '600px',
                width: '90%',
                maxHeight: '90%',
                overflow: 'auto'
            }
        });
        
        // Header
        const header = this.createElement('div', {
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-dark)',
                paddingBottom: '10px'
            }
        }, [
            this.createElement('h3', {
                style: {
                    margin: '0',
                    color: 'var(--primary)'
                },
                textContent: title
            }),
            this.createElement('button', {
                className: 'btn btn-sm btn-outline',
                innerHTML: '<i class="fas fa-times"></i>',
                onclick: () => document.body.removeChild(overlay)
            })
        ]);
        
        modal.appendChild(header);
        
        // Content
        const contentDiv = this.createElement('div', {
            style: {
                marginBottom: '20px'
            },
            innerHTML: content
        });
        
        modal.appendChild(contentDiv);
        
        // Footer con botones
        if (buttons.length > 0) {
            const footer = this.createElement('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    marginTop: '20px',
                    borderTop: '1px solid var(--border-dark)',
                    paddingTop: '15px'
                }
            });
            
            buttons.forEach(button => {
                const btn = this.createElement('button', {
                    className: `btn ${button.class || 'btn-primary'}`,
                    textContent: button.text,
                    onclick: () => {
                        if (button.onclick) button.onclick();
                        if (button.close !== false) {
                            document.body.removeChild(overlay);
                        }
                    }
                });
                
                footer.appendChild(btn);
            });
            
            modal.appendChild(footer);
        }
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Devolver referencia para poder cerrarla programáticamente
        return {
            element: overlay,
            close: () => document.body.removeChild(overlay)
        };
    }
    
    // Crear toast/notificación
    static createToast(message, type = 'info', duration = 4000) {
        const typeIcons = {
            'success': 'check-circle',
            'error': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        
        const typeColors = {
            'success': 'var(--success)',
            'error': 'var(--error)',
            'warning': 'var(--warning)',
            'info': 'var(--info)'
        };
        
        const toast = this.createElement('div', {
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: typeColors[type] || 'var(--primary)',
                color: 'white',
                padding: '15px 20px',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: '10000',
                maxWidth: '400px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slideIn 0.3s ease'
            }
        }, [
            this.createElement('i', {
                className: `fas fa-${typeIcons[type] || 'info-circle'}`
            }),
            this.createElement('div', {
                style: { flex: '1' },
                textContent: message
            }),
            this.createElement('button', {
                style: {
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                },
                innerHTML: '<i class="fas fa-times"></i>',
                onclick: () => document.body.removeChild(toast)
            })
        ]);
        
        document.body.appendChild(toast);
        
        // Auto-remover
        setTimeout(() => {
            if (toast.parentElement) {
                document.body.removeChild(toast);
            }
        }, duration);
        
        return toast;
    }
    
    // Actualizar vista de colores
    static updateColorsPreview(containerId, colors) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!colors || colors.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <i class="fas fa-palette" style="font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
                    <p>No hay colores para mostrar</p>
                </div>
            `;
            return;
        }
        
        let html = '<div><strong>Colores:</strong></div><div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px;">';
        
        colors.forEach((color, index) => {
            const colorHex = Utils.getColorHex(color.val) || '#cccccc';
            html += `
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <div style="background-color: ${colorHex}; border: 1px solid #666; width: 15px; height: 15px; margin-right: 5px; border-radius: 2px;"></div>
                    <span style="font-size: 11px;">${color.screenLetter || index + 1}: ${color.val}</span>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // Crear dropdown
    static createDropdown(label, items, options = {}) {
        const { 
            id = `dropdown-${Date.now()}`,
            onSelect = null,
            selected = null
        } = options;
        
        const container = this.createElement('div', {
            className: 'dropdown-container',
            style: {
                position: 'relative',
                display: 'inline-block'
            }
        });
        
        const button = this.createElement('button', {
            className: 'btn btn-outline',
            textContent: label + ' ▾',
            onclick: (e) => {
                e.stopPropagation();
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
        
        const dropdown = this.createElement('div', {
            className: 'dropdown-menu',
            style: {
                position: 'absolute',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-dark)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                zIndex: '1000',
                display: 'none',
                minWidth: '200px',
                top: '100%',
                left: '0'
            }
        });
        
        items.forEach(item => {
            const itemEl = this.createElement('div', {
                className: `dropdown-item ${selected === item.value ? 'selected' : ''}`,
                style: {
                    padding: '10px 15px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-dark)',
                    transition: 'var(--transition)'
                },
                textContent: item.label,
                onclick: () => {
                    if (onSelect) onSelect(item.value);
                    dropdown.style.display = 'none';
                    button.textContent = item.label + ' ▾';
                }
            });
            
            dropdown.appendChild(itemEl);
        });
        
        container.appendChild(button);
        container.appendChild(dropdown);
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        return container;
    }
}

// Hacer disponible globalmente
window.RenderHelpers = RenderHelpers;
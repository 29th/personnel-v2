				execScriptLoadedCallbacks(url);

							// Load more scripts if they where added by the recently loaded script
							loadScripts();
						});
					}
				});

				// No scripts are currently loading then execute all pending queue loaded callbacks
				if (!loading) {
					tinymce.each(queueLoadedCallbacks, function(callback) {
						callback.func.call(callback.scope);
					});

					queueLoadedCallbacks.length = 0;
				}
			};

			loadScripts();
		};
	};

	// Global script loader
	tinymce.ScriptLoader = new tinymce.dom.ScriptLoader();
})(tinymce);

(function(tinymce) {
	tinymce.dom.RangeUtils = function(dom) {
		var INVISIBLE_CHAR = '\uFEFF';

		this.walk = function(rng, callback) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset,
				ancestor, startPoint,
				endPoint, node, parent, siblings, nodes;

			// Handle table cell selection the table plugin enables
			// you to fake select table cells and perform formatting actions on them
			nodes = dom.select('td.mceSelected,th.mceSelected');
			if (nodes.length > 0) {
				tinymce.each(nodes, function(node) {
					callback([node]);
				});

				return;
			}

			function exclude(nodes) {
				var node;

				// First node is excluded
				node = nodes[0];
				if (node.nodeType === 3 && node === startContainer && startOffset >= node.nodeValue.length) {
					nodes.splice(0, 1);
				}

				// Last node is excluded
				node = nodes[nodes.length - 1];
				if (endOffset === 0 && nodes.length > 0 && node === endContainer && node.nodeType === 3) {
					nodes.splice(nodes.length - 1, 1);
				}

				return nodes;
			};

			function collectSiblings(node, name, end_node) {
				var siblings = [];

				for (; node && node != end_node; node = node[name])
					siblings.push(node);

				return siblings;
			};

			function findEndPoint(node, root) {
				do {
					if (node.parentNode == root)
						return node;

					node = node.parentNode;
				} while(node);
			};

			function walkBoundary(start_node, end_node, next) {
				var siblingName = next ? 'nextSibling' : 'previousSibling';

				for (node = start_node, parent = node.parentNode; node && node != end_node; node = parent) {
					parent = node.parentNode;
					siblings = collectSiblings(node == start_node ? node : node[siblingName], siblingName);

					if (siblings.length) {
						if (!next)
							siblings.reverse();

						callback(exclude(siblings));
					}
				}
			};

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes())
				startContainer = startContainer.childNodes[startOffset];

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes())
				endContainer = endContainer.childNodes[Math.min(endOffset - 1, endContainer.childNodes.length - 1)];

			// Same container
			if (startContainer == endContainer)
				return callback(exclude([startContainer]));

			// Find common ancestor and end points
			ancestor = dom.findCommonAncestor(startContainer, endContainer);
				
			// Process left side
			for (node = startContainer; node; node = node.parentNode) {
				if (node === endContainer)
					return walkBoundary(startContainer, ancestor, true);

				if (node === ancestor)
					break;
			}

			// Process right side
			for (node = endContainer; node; node = node.parentNode) {
				if (node === startContainer)
					return walkBoundary(endContainer, ancestor);

				if (node === ancestor)
					break;
			}

			// Find start/end point
			startPoint = findEndPoint(startContainer, ancestor) || startContainer;
			endPoint = findEndPoint(endContainer, ancestor) || endContainer;

			// Walk left leaf
			walkBoundary(startContainer, startPoint, true);

			// Walk the middle from start to end point
			siblings = collectSiblings(
				startPoint == startContainer ? startPoint : startPoint.nextSibling,
				'nextSibling',
				endPoint == endContainer ? endPoint.nextSibling : endPoint
			);

			if (siblings.length)
				callback(exclude(siblings));

			// Walk right leaf
			walkBoundary(endContainer, endPoint);
		};

		this.split = function(rng) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset;

			function splitText(node, offset) {
				return node.splitText(offset);
			};

			// Handle single text node
			if (startContainer == endContainer && startContainer.nodeType == 3) {
				if (startOffset > 0 && startOffset < startContainer.nodeValue.length) {
					endContainer = splitText(startContainer, startOffset);
					startContainer = endContainer.previousSibling;

					if (endOffset > startOffset) {
						endOffset = endOffset - startOffset;
						startContainer = endContainer = splitText(endContainer, endOffset).previousSibling;
						endOffset = endContainer.nodeValue.length;
						startOffset = 0;
					} else {
						endOffset = 0;
					}
				}
			} else {
				// Split startContainer text node if needed
				if (startContainer.nodeType == 3 && startOffset > 0 && startOffset < startContainer.nodeValue.length) {
					startContainer = splitText(startContainer, startOffset);
					startOffset = 0;
				}

				// Split endContainer text node if needed
				if (endContainer.nodeType == 3 && endOffset > 0 && endOffset < endContainer.nodeValue.length) {
					endContainer = splitText(endContainer, endOffset).previousSibling;
					endOffset = endContainer.nodeValue.length;
				}
			}

			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		};

	};

	tinymce.dom.RangeUtils.compareRanges = function(rng1, rng2) {
		if (rng1 && rng2) {
			// Compare native IE ranges
			if (rng1.item || rng1.duplicate) {
				// Both are control ranges and the selected element matches
				if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0))
					return true;

				// Both are text ranges and the range matches
				if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1))
					return true;
			} else {
				// Compare w3c ranges
				return rng1.startContainer == rng2.startContainer && rng1.startOffset == rng2.startOffset;
			}
		}

		return false;
	};
})(tinymce);

(function(tinymce) {
	var Event = tinymce.dom.Event, each = tinymce.each;

	tinymce.create('tinymce.ui.KeyboardNavigation', {
		KeyboardNavigation: function(settings, dom) {
			var t = this, root = settings.root, items = settings.items,
					enableUpDown = settings.enableUpDown, enableLeftRight = settings.enableLeftRight || !settings.enableUpDown,
					excludeFromTabOrder = settings.excludeFromTabOrder,
					itemFocussed, itemBlurred, rootKeydown, rootFocussed, focussedId;

			dom = dom || tinymce.DOM;

			itemFocussed = function(evt) {
				focussedId = evt.target.id;
			};
			
			itemBlurred = function(evt) {
				dom.setAttrib(evt.target.id, 'tabindex', '-1');
			};
			
			rootFocussed = function(evt) {
				var item = dom.get(focussedId);
				dom.setAttrib(item, 'tabindex', '0');
				item.focus();
			};
			
			t.focus = function() {
				dom.get(focussedId).focus();
			};

			t.destroy = function() {
				each(items, function(item) {
					var elm = dom.get(item.id);

					dom.unbind(elm, 'focus', itemFocussed);
					dom.unbind(elm, 'blur', itemBlurred);
				});

				var rootElm = dom.get(root);
				dom.unbind(rootElm, 'focus', rootFocussed);
				dom.unbind(rootElm, 'keydown', rootKeydown);

				items = dom = root = t.focus = itemFocussed = itemBlurred = rootKeydown = rootFocussed = null;
				t.destroy = function() {};
			};
			
			t.moveFocus = function(dir, evt) {
				var idx = -1, controls = t.controls, newFocus;

				if (!focussedId)
					return;

				each(items, function(item, index) {
					if (item.id === focussedId) {
						idx = index;
						return false;
					}
				});

				idx += dir;
				if (idx < 0) {
					idx = items.length - 1;
				} else if (idx >= items.length) {
					idx = 0;
				}
				
				newFocus = items[idx];
				dom.setAttrib(focussedId, 'tabindex', '-1');
				dom.setAttrib(newFocus.id, 'tabindex', '0');
				dom.get(newFocus.id).focus();

				if (settings.actOnFocus) {
					settings.onAction(newFocus.id);
				}

				if (evt)
					Event.cancel(evt);
			};
			
			rootKeydown = function(evt) {
				var DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40, DOM_VK_ESCAPE = 27, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_SPACE = 32;
				
				switch (evt.keyCode) {
					case DOM_VK_LEFT:
						if (enableLeftRight) t.moveFocus(-1);
						break;
	
					case DOM_VK_RIGHT:
						if (enableLeftRight) t.moveFocus(1);
						break;
	
					case DOM_VK_UP:
						if (enableUpDown) t.moveFocus(-1);
						break;

					case DOM_VK_DOWN:
						if (enableUpDown) t.moveFocus(1);
						break;

					case DOM_VK_ESCAPE:
						if (settings.onCancel) {
							settings.onCancel();
							Event.cancel(evt);
						}
						break;

					case DOM_VK_ENTER:
					case DOM_VK_RETURN:
					case DOM_VK_SPACE:
						if (settings.onAction) {
							settings.onAction(focussedId);
							Event.cancel(evt);
						}
						break;
				}
			};

			// Set up state and listeners for each item.
			each(items, function(item, idx) {
				var tabindex, elm;

				if (!item.id) {
					item.id = dom.uniqueId('_mce_item_');
				}

				elm = dom.get(item.id);

				if (excludeFromTabOrder) {
					dom.bind(elm, 'blur', itemBlurred);
					tabindex = '-1';
				} else {
					tabindex = (idx === 0 ? '0' : '-1');
				}

				elm.setAttribute('tabindex', tabindex);
				dom.bind(elm, 'focus', itemFocussed);
			});
			
			// Setup initial state for root element.
			if (items[0]){
				focussedId = items[0].id;
			}

			dom.setAttrib(root, 'tabindex', '-1');

			// Setup listeners for root element.
			var rootElm = dom.get(root);
			dom.bind(rootElm, 'focus', rootFocussed);
			dom.bind(rootElm, 'keydown', rootKeydown);
		}
	});
})(tinymce);

(function(tinymce) {
	// Shorten class names
	var DOM = tinymce.DOM, is = tinymce.is;

	tinymce.create('tinymce.ui.Control', {
		Control : function(id, s, editor) {
			this.id = id;
			this.settings = s = s || {};
			this.rendered = false;
			this.onRender = new tinymce.util.Dispatcher(this);
			this.classPrefix = '';
			this.scope = s.scope || this;
			this.disabled = 0;
			this.active = 0;
			this.editor = editor;
		},
		
		setAriaProperty : function(property, value) {
			var element = DOM.get(this.id + '_aria') || DOM.get(this.id);
			if (element) {
				DOM.setAttrib(element, 'aria-' + property, !!value);
			}
		},
		
		focus : function() {
			DOM.get(this.id).focus();
		},

		setDisabled : function(s) {
			if (s != this.disabled) {
				this.setAriaProperty('disabled', s);

				this.setState('Disabled', s);
				this.setState('Enabled', !s);
				this.disabled = s;
			}
		},

		isDisabled : function() {
			return this.disabled;
		},

		setActive : function(s) {
			if (s != this.active) {
				this.setState('Active', s);
				this.active = s;
				this.setAriaProperty('pressed', s);
			}
		},

		isActive : function() {
			return this.active;
		},

		setState : function(c, s) {
			var n = DOM.get(this.id);

			c = this.classPrefix + c;

			if (s)
				DOM.addClass(n, c);
			else
				DOM.removeClass(n, c);
		},

		isRendered : function() {
			return this.rendered;
		},

		renderHTML : function() {
		},

		renderTo : function(n) {
			DOM.setHTML(n, this.renderHTML());
		},

		postRender : function() {
			var t = this, b;

			// Set pending states
			if (is(t.disabled)) {
				b = t.disabled;
				t.disabled = -1;
				t.setDisabled(b);
			}

			if (is(t.active)) {
				b = t.active;
				t.active = -1;
				t.setActive(b);
			}
		},

		remove : function() {
			DOM.remove(this.id);
			this.destroy();
		},

		destroy : function() {
			tinymce.dom.Event.clear(this.id);
		}
	});
})(tinymce);
tinymce.create('tinymce.ui.Container:tinymce.ui.Control', {
	Container : function(id, s, editor) {
		this.parent(id, s, editor);

		this.controls = [];

		this.lookup = {};
	},

	add : function(c) {
		this.lookup[c.id] = c;
		this.controls.push(c);

		return c;
	},

	get : function(n) {
		return this.lookup[n];
	}
});


tinymce.create('tinymce.ui.Separator:tinymce.ui.Control', {
	Separator : function(id, s) {
		this.parent(id, s);
		this.classPrefix = 'mceSeparator';
		this.setDisabled(true);
	},

	renderHTML : function() {
		return tinymce.DOM.createHTML('span', {'class' : this.classPrefix, role : 'separator', 'aria-orientation' : 'vertical', tabindex : '-1'});
	}
});

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	tinymce.create('tinymce.ui.MenuItem:tinymce.ui.Control', {
		MenuItem : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceMenuItem';
		},

		setSelected : function(s) {
			this.setState('Selected', s);
			this.setAriaProperty('checked', !!s);
			this.selected = s;
		},

		isSelected : function() {
			return this.selected;
		},

		postRender : function() {
			var t = this;
			
			t.parent();

			// Set pending state
			if (is(t.selected))
				t.setSelected(t.selected);
		}
	});
})(tinymce);

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	tinymce.create('tinymce.ui.Menu:tinymce.ui.MenuItem', {
		Menu : function(id, s) {
			var t = this;

			t.parent(id, s);
			t.items = {};
			t.collapsed = false;
			t.menuCount = 0;
			t.onAddItem = new tinymce.util.Dispatcher(this);
		},

		expand : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.expand)
						o.expand();
				}, 'items', t);
			}

			t.collapsed = false;
		},

		collapse : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.collapse)
						o.collapse();
				}, 'items', t);
			}

			t.collapsed = true;
		},

		isCollapsed : function() {
			return this.collapsed;
		},

		add : function(o) {
			if (!o.settings)
				o = new tinymce.ui.MenuItem(o.id || DOM.uniqueId(), o);

			this.onAddItem.dispatch(this, o);

			return this.items[o.id] = o;
		},

		addSeparator : function() {
			return this.add({separator : true});
		},

		addMenu : function(o) {
			if (!o.collapse)
				o = this.createMenu(o);

			this.menuCount++;

			return this.add(o);
		},

		hasMenus : function() {
			return this.menuCount !== 0;
		},

		remove : function(o) {
			delete this.items[o.id];
		},

		removeAll : function() {
			var t = this;

			walk(t, function(o) {
				if (o.removeAll)
					o.removeAll();
				else
					o.remove();

				o.destroy();
			}, 'items', t);

			t.items = {};
		},

		createMenu : function(o) {
			var m = new tinymce.ui.Menu(o.id || DOM.uniqueId(), o);

			m.onAddItem.add(this.onAddItem.dispatch, this.onAddItem);

			return m;
		}
	});
})(tinymce);
(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event, Element = tinymce.dom.Element;

	tinymce.create('tinymce.ui.DropMenu:tinymce.ui.Menu', {
		DropMenu : function(id, s) {
			s = s || {};
			s.container = s.container || DOM.doc.body;
			s.offset_x = s.offset_x || 0;
			s.offset_y = s.offset_y || 0;
			s.vp_offset_x = s.vp_offset_x || 0;
			s.vp_offset_y = s.vp_offset_y || 0;

			if (is(s.icons) && !s.icons)
				s['class'] += ' mceNoIcons';

			this.parent(id, s);
			this.onShowMenu = new tinymce.util.Dispatcher(this);
			this.onHideMenu = new tinymce.util.Dispatcher(this);
			this.classPrefix = 'mceMenu';
		},

		createMenu : function(s) {
			var t = this, cs = t.settings, m;

			s.container = s.container || cs.container;
			s.parent = t;
			s.constrain = s.constrain || cs.constrain;
			s['class'] = s['class'] || cs['class'];
			s.vp_offset_x = s.vp_offset_x || cs.vp_offset_x;
			s.vp_offset_y = s.vp_offset_y || cs.vp_offset_y;
			s.keyboard_focus = cs.keyboard_focus;
			m = new tinymce.ui.DropMenu(s.id || DOM.uniqueId(), s);

			m.onAddItem.add(t.onAddItem.dispatch, t.onAddItem);

			return m;
		},
		
		focus : function() {
			var t = this;
			if (t.keyboardNav) {
				t.keyboardNav.focus();
			}
		},

		update : function() {
			var t = this, s = t.settings, tb = DOM.get('menu_' + t.id + '_tbl'), co = DOM.get('menu_' + t.id + '_co'), tw, th;

			tw = s.max_width ? Math.min(tb.offsetWidth, s.max_width) : tb.offsetWidth;
			th = s.max_height ? Math.min(tb.offsetHeight, s.max_height) : tb.offsetHeight;

			if (!DOM.boxModel)
				t.element.setStyles({width : tw + 2, height : th + 2});
			else
				t.element.setStyles({width : tw, height : th});

			if (s.max_width)
				DOM.setStyle(co, 'width', tw);

			if (s.max_height) {
				DOM.setStyle(co, 'height', th);

				if (tb.clientHeight < s.max_height)
					DOM.setStyle(co, 'overflow', 'hidden');
			}
		},

		showMenu : function(x, y, px) {
			var t = this, s = t.settings, co, vp = DOM.getViewPort(), w, h, mx, my, ot = 2, dm, tb, cp = t.classPrefix;

			t.collapse(1);

			if (t.isMenuVisible)
				return;

			if (!t.rendered) {
				co = DOM.add(t.settings.container, t.renderNode());

				each(t.items, function(o) {
					o.postRender();
				});

				t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});
			} else
				co = DOM.get('menu_' + t.id);

			// Move layer out of sight unless it's Opera since it scrolls to top of page due to an bug
			if (!tinymce.isOpera)
				DOM.setStyles(co, {left : -0xFFFF , top : -0xFFFF});

			DOM.show(co);
			t.update();

			x += s.offset_x || 0;
			y += s.offset_y || 0;
			vp.w -= 4;
			vp.h -= 4;

			// Move inside viewport if not submenu
			if (s.constrain) {
				w = co.clientWidth - ot;
				h = co.clientHeight - ot;
				mx = vp.x + vp.w;
				my = vp.y + vp.h;

				if ((x + s.vp_offset_x + w) > mx)
					x = px ? px - w : Math.max(0, (mx - s.vp_offset_x) - w);

				if ((y + s.vp_offset_y + h) > my)
					y = Math.max(0, (my - s.vp_offset_y) - h);
			}

			DOM.setStyles(co, {left : x , top : y});
			t.element.update();

			t.isMenuVisible = 1;
			t.mouseClickFunc = Event.add(co, 'click', function(e) {
				var m;

				e = e.target;

				if (e && (e = DOM.getParent(e, 'tr')) && !DOM.hasClass(e, cp + 'ItemSub')) {
					m = t.items[e.id];

					if (m.isDisabled())
						return;

					dm = t;

					while (dm) {
						if (dm.hideMenu)
							dm.hideMenu();

						dm = dm.settings.parent;
					}

					if (m.settings.onclick)
						m.settings.onclick(e);

					return false; // Cancel to fix onbeforeunload problem
				}
			});

			if (t.hasMenus()) {
				t.mouseOverFunc = Event.add(co, 'mouseover', function(e) {
					var m, r, mi;

					e = e.target;
					if (e && (e = DOM.getParent(e, 'tr'))) {
						m = t.items[e.id];

						if (t.lastMenu)
							t.lastMenu.collapse(1);

						if (m.isDisabled())
							return;

						if (e && DOM.hasClass(e, cp + 'ItemSub')) {
							//p = DOM.getPos(s.container);
							r = DOM.getRect(e);
							m.showMenu((r.x + r.w - ot), r.y - ot, r.x);
							t.lastMenu = m;
							DOM.addClass(DOM.get(m.id).firstChild, cp + 'ItemActive');
						}
					}
				});
			}
			
			Event.add(co, 'keydown', t._keyHandler, t);

			t.onShowMenu.dispatch(t);

			if (s.keyboard_focus) { 
				t._setupKeyboardNav(); 
			}
		},

		hideMenu : function(c) {
			var t = this, co = DOM.get('menu_' + t.id), e;

			if (!t.isMenuVisible)
				return;

			if (t.keyboardNav) t.keyboardNav.destroy();
			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);
			Event.remove(co, 'keydown', t._keyHandler);
			DOM.hide(co);
			t.isMenuVisible = 0;

			if (!c)
				t.collapse(1);

			if (t.element)
				t.element.hide();

			if (e = DOM.get(t.id))
				DOM.removeClass(e.firstChild, t.classPrefix + 'ItemActive');

			t.onHideMenu.dispatch(t);
		},

		add : function(o) {
			var t = this, co;

			o = t.parent(o);

			if (t.isRendered && (co = DOM.get('menu_' + t.id)))
				t._add(DOM.select('tbody', co)[0], o);

			return o;
		},

		collapse : function(d) {
			this.parent(d);
			this.hideMenu(1);
		},

		remove : function(o) {
			DOM.remove(o.id);
			this.destroy();

			return this.parent(o);
		},

		destroy : function() {
			var t = this, co = DOM.get('menu_' + t.id);

			if (t.keyboardNav) t.keyboardNav.destroy();
			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(DOM.select('a', co), 'focus', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);
			Event.remove(co, 'keydown', t._keyHandler);

			if (t.element)
				t.element.remove();

			DOM.remove(co);
		},

		renderNode : function() {
			var t = this, s = t.settings, n, tb, co, w;

			w = DOM.create('div', {role: 'listbox', id : 'menu_' + t.id, 'class' : s['class'], 'style' : 'position:absolute;left:0;top:0;z-index:200000;outline:0'});
			if (t.settings.parent) {
				DOM.setAttrib(w, 'aria-parent', 'menu_' + t.settings.parent.id);
			}
			co = DOM.add(w, 'div', {role: 'presentation', id : 'menu_' + t.id + '_co', 'class' : t.classPrefix + (s['class'] ? ' ' + s['class'] : '')});
			t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});

			if (s.menu_line)
				DOM.add(co, 'span', {'class' : t.classPrefix + 'Line'});

//			n = DOM.add(co, 'div', {id : 'menu_' + t.id + '_co', 'class' : 'mceMenuContainer'});
			n = DOM.add(co, 'table', {role: 'presentation', id : 'menu_' + t.id + '_tbl', border : 0, cellPadding : 0, cellSpacing : 0});
			tb = DOM.add(n, 'tbody');

			each(t.items, function(o) {
				t._add(tb, o);
			});

			t.rendered = true;

			return w;
		},

		// Internal functions
		_setupKeyboardNav : function(){
			var contextMenu, menuItems, t=this; 
			contextMenu = DOM.get('menu_' + t.id);
			menuItems = DOM.select('a[role=option]', 'menu_' + t.id);
			menuItems.splice(0,0,contextMenu);
			t.keyboardNav = new tinymce.ui.KeyboardNavigation({
				root: 'menu_' + t.id,
				items: menuItems,
				onCancel: function() {
					t.hideMenu();
				},
				enableUpDown: true
			});
			contextMenu.focus();
		},

		_keyHandler : function(evt) {
			var t = this, e;
			switch (evt.keyCode) {
				case 37: // Left
					if (t.settings.parent) {
						t.hideMenu();
						t.settings.parent.focus();
						Event.cancel(evt);
					}
					break;
				case 39: // Right
					if (t.mouseOverFunc)
						t.mouseOverFunc(evt);
					break;
			}
		},

		_add : function(tb, o) {
			var n, s = o.settings, a, ro, it, cp = this.classPrefix, ic;

			if (s.separator) {
				ro = DOM.add(tb, 'tr', {id : o.id, 'class' : cp + 'ItemSeparator'});
				DOM.add(ro, 'td', {'class' : cp + 'ItemSeparator'});

				if (n = ro.previousSibling)
					DOM.addClass(n, 'mceLast');

				return;
			}

			n = ro = DOM.add(tb, 'tr', {id : o.id, 'class' : cp + 'Item ' + cp + 'ItemEnabled'});
			n = it = DOM.add(n, s.titleItem ? 'th' : 'td');
			n = a = DOM.add(n, 'a', {id: o.id + '_aria',  role: s.titleItem ? 'presentation' : 'option', href : 'javascript:;', onclick : "return false;", onmousedown : 'return false;'});

			if (s.parent) {
				DOM.setAttrib(a, 'aria-haspopup', 'true');
				DOM.setAttrib(a, 'aria-owns', 'menu_' + o.id);
			}

			DOM.addClass(it, s['class']);
//			n = DOM.add(n, 'span', {'class' : 'item'});

			ic = DOM.add(n, 'span', {'class' : 'mceIcon' + (s.icon ? ' mce_' + s.icon : '')});

			if (s.icon_src)
				DOM.add(ic, 'img', {src : s.icon_src});

			n = DOM.add(n, s.element || 'span', {'class' : 'mceText', title : o.settings.title}, o.settings.title);

			if (o.settings.style) {
				if (typeof o.settings.style == "function")
					o.settings.style = o.settings.style();

				DOM.setAttrib(n, 'style', o.settings.style);
			}

			if (tb.childNodes.length == 1)
				DOM.addClass(ro, 'mceFirst');

			if ((n = ro.previousSibling) && DOM.hasClass(n, cp + 'ItemSeparator'))
				DOM.addClass(ro, 'mceFirst');

			if (o.collapse)
				DOM.addClass(ro, cp + 'ItemSub');

			if (n = ro.previousSibling)
				DOM.removeClass(n, 'mceLast');

			DOM.addClass(ro, 'mceLast');
		}
	});
})(tinymce);
(function(tinymce) {
	var DOM = tinymce.DOM;

	tinymce.create('tinymce.ui.Button:tinymce.ui.Control', {
		Button : function(id, s, ed) {
			this.parent(id, s, ed);
			this.classPrefix = 'mceButton';
		},

		renderHTML : function() {
			var cp = this.classPrefix, s = this.settings, h, l;

			l = DOM.encode(s.label || '');
			h = '<a role="button" id="' + this.id + '" href="javascript:;" class="' + cp + ' ' + cp + 'Enabled ' + s['class'] + (l ? ' ' + cp + 'Labeled' : '') +'" onmousedown="return false;" onclick="return false;" aria-labelledby="' + this.id + '_voice" title="' + DOM.encode(s.title) + '">';
			if (s.image && !(this.editor  &&this.editor.forcedHighContrastMode) )
				h += '<span class="mceIcon ' + s['class'] + '"><img class="mceIcon" src="' + s.image + '" alt="' + DOM.encode(s.title) + '" /></span>' + (l ? '<span class="' + cp + 'Label">' + l + '</span>' : '');
			else
				h += '<span class="mceIcon ' + s['class'] + '"></span>' + (l ? '<span class="' + cp + 'Label">' + l + '</span>' : '');

			h += '<span class="mceVoiceLabel mceIconOnly" style="display: none;" id="' + this.id + '_voice">' + s.title + '</span>'; 
			h += '</a>';
			return h;
		},

		postRender : function() {
			var t = this, s = t.settings, imgBookmark;

			// In IE a large image that occupies the entire editor area will be deselected when a button is clicked, so
			// need to keep the selection in case the selection is lost
			if (tinymce.isIE && t.editor) {
				tinymce.dom.Event.add(t.id, 'mousedown', function(e) {
					var nodeName = t.editor.selection.getNode().nodeName;
					imgBookmark = nodeName === 'IMG' ? t.editor.selection.getBookmark() : null;
				});
			}
			tinymce.dom.Event.add(t.id, 'click', function(e) {
				if (!t.isDisabled()) {
					// restore the selection in case the selection is lost in IE
					if (tinymce.isIE && t.editor && imgBookmark !== null) {
						t.editor.selection.moveToBookmark(imgBookmark);
					}
					return s.onclick.call(s.scope, e);
				}
			});
			tinymce.dom.Event.add(t.id, 'keyup', function(e) {
				if (!t.isDisabled() && e.keyCode==tinymce.VK.SPACEBAR)
					return s.onclick.call(s.scope, e);
			});
		}
	});
})(tinymce);

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher, undef;

	tinymce.create('tinymce.ui.ListBox:tinymce.ui.Control', {
		ListBox : function(id, s, ed) {
			var t = this;

			t.parent(id, s, ed);

			t.items = [];

			t.onChange = new Dispatcher(t);

			t.onPostRender = new Dispatcher(t);

			t.onAdd = new Dispatcher(t);

			t.onRenderMenu = new tinymce.util.Dispatcher(this);

			t.classPrefix = 'mceListBox';
			t.marked = {};
		},

		select : function(va) {
			var t = this, fv, f;

			t.marked = {};

			if (va == undef)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && typeof(va)=="function")
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		selectByIndex : function(idx) {
			var t = this, e, o, label;

			t.marked = {};

			if (idx != t.selectedIndex) {
				e = DOM.get(t.id + '_text');
				label = DOM.get(t.id + '_voiceDesc');
				o = t.items[idx];

				if (o) {
					t.selectedValue = o.value;
					t.selectedIndex = idx;
					DOM.setHTML(e, DOM.encode(o.title));
					DOM.setHTML(label, t.settings.title + " - " + o.title);
					DOM.removeClass(e, 'mceTitle');
					DOM.setAttrib(t.id, 'aria-valuenow', o.title);
				} else {
					DOM.setHTML(e, DOM.encode(t.settings.title));
					DOM.setHTML(label, DOM.encode(t.settings.title));
					DOM.addClass(e, 'mceTitle');
					t.selectedValue = t.selectedIndex = null;
					DOM.setAttrib(t.id, 'aria-valuenow', t.settings.title);
				}
				e = 0;
			}
		},

		mark : function(value) {
			this.marked[value] = true;
		},

		add : function(n, v, o) {
			var t = this;

			o = o || {};
			o = tinymce.extend(o, {
				title : n,
				value : v
			});

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		getLength : function() {
			return this.items.length;
		},

		renderHTML : function() {
			var h = '', t = this, s = t.settings, cp = t.classPrefix;

			h = '<span role="listbox" aria-haspopup="true" aria-labelledby="' + t.id +'_voiceDesc" aria-describedby="' + t.id + '_voiceDesc"><table role="presentation" tabindex="0" id="' + t.id + '" cellpadding="0" cellspacing="0" class="' + cp + ' ' + cp + 'Enabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tbody><tr>';
			h += '<td>' + DOM.createHTML('span', {id: t.id + '_voiceDesc', 'class': 'voiceLabel', style:'display:none;'}, t.settings.title); 
			h += DOM.createHTML('a', {id : t.id + '_text', tabindex : -1, href : 'javascript:;', 'class' : 'mceText', onclick : "return false;", onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', tabindex : -1, href : 'javascript:;', 'class' : 'mceOpen', onclick : "return false;", onmousedown : 'return false;'}, '<span><span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span></span>') + '</td>';
			h += '</tr></tbody></table></span>';

			return h;
		},

		showMenu : function() {
			var t = this, p2, e = DOM.get(this.id), m;

			if (t.isDisabled() || t.items.length === 0)
				return;

			if (t.menu && t.menu.isMenuVisible)
				return t.hideMenu();

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.keyboard_focus = !tinymce.isOpera; // Opera is buggy when it comes to auto focus

			// Select in menu
			each(t.items, function(o) {
				if (m.items[o.id]) {
					m.items[o.id].setSelected(0);
				}
			});

			each(t.items, function(o) {
				if (m.items[o.id] && t.marked[o.value]) {
					m.items[o.id].setSelected(1);
				}

				if (o.value === t.selectedValue) {
					m.items[o.id].setSelected(1);
				}
			});

			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			DOM.addClass(t.id, t.classPrefix + 'Selected');

			//DOM.get(t.id + '_text').focus();
		},

		hideMenu : function(e) {
			var t = this;

			if (t.menu && t.menu.isMenuVisible) {
				DOM.removeClass(t.id, t.classPrefix + 'Selected');

				// Prevent double toogles by canceling the mouse click event to the button
				if (e && e.type == "mousedown" && (e.target.id == t.id + '_text' || e.target.id == t.id + '_open'))
					return;

				if (!e || !DOM.getParent(e.target, '.mceMenu')) {
					DOM.removeClass(t.id, t.classPrefix + 'Selected');
					Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
					t.menu.hideMenu();
				}
			}
		},

		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : t.classPrefix + 'Menu mceNoIcons',
				max_width : 250,
				max_height : 150
			});

			m.onHideMenu.add(function() {
				t.hideMenu();
				t.focus();
			});

			m.add({
				title : t.settings.title,
				'class' : 'mceMenuItemTitle',
				onclick : function() {
					if (t.settings.onselect('') !== false)
						t.select(''); // Must be runned after
				}
			});

			each(t.items, function(o) {
				// No value then treat it as a title
				if (o.value === undef) {
					m.add({
						title : o.title,
						role : "option",
						'class' : 'mceMenuItemTitle',
						onclick : function() {
							if (t.settings.onselect('') !== false)
								t.select(''); // Must be runned after
						}
					});
				} else {
					o.id = DOM.uniqueId();
					o.role= "option";
					o.onclick = function() {
						if (t.settings.onselect(o.value) !== false)
							t.select(o.value); // Must be runned after
					};

					m.add(o);
				}
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		postRender : function() {
			var t = this, cp = t.classPrefix;

			Event.add(t.id, 'click', t.showMenu, t);
			Event.add(t.id, 'keydown', function(evt) {
				if (evt.keyCode == 32) { // Space
					t.showMenu(evt);
					Event.cancel(evt);
				}
			});
			Event.add(t.id, 'focus', function() {
				if (!t._focused) {
					t.keyDownHandler = Event.add(t.id, 'keydown', function(e) {
						if (e.keyCode == 40) {
							t.showMenu();
							Event.cancel(e);
						}
					});
					t.keyPressHandler = Event.add(t.id, 'keypress', function(e) {
						var v;
						if (e.keyCode == 13) {
							// Fake select on enter
							v = t.selectedValue;
							t.selectedValue = null; // Needs to be null to fake change
							Event.cancel(e);
							t.settings.onselect(v);
						}
					});
				}

				t._focused = 1;
			});
			Event.add(t.id, 'blur', function() {
				Event.remove(t.id, 'keydown', t.keyDownHandler);
				Event.remove(t.id, 'keypress', t.keyPressHandler);
				t._focused = 0;
			});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.addClass(t.id, cp + 'Hover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.removeClass(t.id, cp + 'Hover');
				});
			}

			t.onPostRender.dispatch(t, DOM.get(t.id));
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_text');
			Event.clear(this.id + '_open');
		}
	});
})(tinymce);

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher, undef;

	tinymce.create('tinymce.ui.NativeListBox:tinymce.ui.ListBox', {
		NativeListBox : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceNativeListBox';
		},

		setDisabled : function(s) {
			DOM.get(this.id).disabled = s;
			this.setAriaProperty('disabled', s);
		},

		isDisabled : function() {
			return DOM.get(this.id).disabled;
		},

		select : function(va) {
			var t = this, fv, f;

			if (va == undef)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && typeof(va)=="function")
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		selectByIndex : function(idx) {
			DOM.get(this.id).selectedIndex = idx + 1;
			this.selectedValue = this.items[idx] ? this.items[idx].value : null;
		},

		add : function(n, v, a) {
			var o, t = this;

			a = a || {};
			a.value = v;

			if (t.isRendered())
				DOM.add(DOM.get(this.id), 'option', a, n);

			o = {
				title : n,
				value : v,
				attribs : a
			};

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		getLength : function() {
			return this.items.length;
		},

		renderHTML : function() {
			var h, t = this;

			h = DOM.createHTML('option', {value : ''}, '-- ' + t.settings.title + ' --');

			each(t.items, function(it) {
				h += DOM.createHTML('option', {value : it.value}, it.title);
			});

			h = DOM.createHTML('select', {id : t.id, 'class' : 'mceNativeListBox', 'aria-labelledby': t.id + '_aria'}, h);
			h += DOM.createHTML('span', {id : t.id + '_aria', 'style': 'display: none'}, t.settings.title);
			return h;
		},

		postRender : function() {
			var t = this, ch, changeListenerAdded = true;

			t.rendered = true;

			function onChange(e) {
				var v = t.items[e.target.selectedIndex - 1];

				if (v && (v = v.value)) {
					t.onChange.dispatch(t, v);

					if (t.settings.onselect)
						t.settings.onselect(v);
				}
			};

			Event.add(t.id, 'change', onChange);

			// Accessibility keyhandler
			Event.add(t.id, 'keydown', function(e) {
				var bf;

				Event.remove(t.id, 'change', ch);
				changeListenerAdded = false;

				bf = Event.add(t.id, 'blur', function() {
					if (changeListenerAdded) return;
					changeListenerAdded = true;
					Event.add(t.id, 'change', onChange);
					Event.remove(t.id, 'blur', bf);
				});

				//prevent default left and right keys on chrome - so that the keyboard navigation is used.
				if (tinymce.isWebKit && (e.keyCode==37 ||e.keyCode==39)) {
					return Event.prevent(e);
				}
				
				if (e.keyCode == 13 || e.keyCode == 32) {
					onChange(e);
					return Event.cancel(e);
				}
			});

			t.onPostRender.dispatch(t, DOM.get(t.id));
		}
	});
})(tinymce);

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	tinymce.create('tinymce.ui.MenuButton:tinymce.ui.Button', {
		MenuButton : function(id, s, ed) {
			this.parent(id, s, ed);

			this.onRenderMenu = new tinymce.util.Dispatcher(this);

			s.menu_container = s.menu_container || DOM.doc.body;
		},

		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(t.id), m;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			p1 = DOM.getPos(t.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.vp_offset_x = p2.x;
			m.settings.vp_offset_y = p2.y;
			m.settings.keyboard_focus = t._focused;
			m.showMenu(0, e.firstChild.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.setState('Selected', 1);

			t.isMenuVisible = 1;
		},

		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : this.classPrefix + 'Menu',
				icons : t.settings.icons
			});

			m.onHideMenu.add(function() {
				t.hideMenu();
				t.focus();
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id || e.id === t.id + '_open';}))
				return;

			if (!e || !DOM.getParent(e.target, '.mceMenu')) {
				t.setState('Selected', 0);
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
				if (t.menu)
					t.menu.hideMenu();
			}

			t.isMenuVisible = 0;
		},

		postRender : function() {
			var t = this, s = t.settings;

			Event.add(t.id, 'click', function() {
				if (!t.isDisabled()) {
					if (s.onclick)
						s.onclick(t.value);

					t.showMenu();
				}
			});
		}
	});
})(tinymce);

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	tinymce.create('tinymce.ui.SplitButton:tinymce.ui.MenuButton', {
		SplitButton : function(id, s, ed) {
			this.parent(id, s, ed);
			this.classPrefix = 'mceSplitButton';
		},

		renderHTML : function() {
			var h, t = this, s = t.settings, h1;

			h = '<tbody><tr>';

			if (s.image)
				h1 = DOM.createHTML('img ', {src : s.image, role: 'presentation', 'class' : 'mceAction ' + s['class']});
			else
				h1 = DOM.createHTML('span', {'class' : 'mceAction ' + s['class']}, '');

			h1 += DOM.createHTML('span', {'class': 'mceVoiceLabel mceIconOnly', id: t.id + '_voice', style: 'display:none;'}, s.title);
			h += '<td >' + DOM.createHTML('a', {role: 'button', id : t.id + '_action', tabindex: '-1', href : 'javascript:;', 'class' : 'mceAction ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';
	
			h1 = DOM.createHTML('span', {'class' : 'mceOpen ' + s['class']}, '<span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span>');
			h += '<td >' + DOM.createHTML('a', {role: 'button', id : t.id + '_open', tabindex: '-1', href : 'javascript:;', 'class' : 'mceOpen ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';

			h += '</tr></tbody>';
			h = DOM.createHTML('table', { role: 'presentation',   'class' : 'mceSplitButton mceSplitButtonEnabled ' + s['class'], cellpadding : '0', cellspacing : '0', title : s.title}, h);
			return DOM.createHTML('div', {id : t.id, role: 'button', tabindex: '0', 'aria-labelledby': t.id + '_voice', 'aria-haspopup': 'true'}, h);
		},

		postRender : function() {
			var t = this, s = t.settings, activate;

			if (s.onclick) {
				activate = function(evt) {
					if (!t.isDisabled()) {
						s.onclick(t.value);
						Event.cancel(evt);
					}
				};
				Event.add(t.id + '_action', 'click', activate);
				Event.add(t.id, ['click', 'keydown'], function(evt) {
					var DOM_VK_SPACE = 32, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_UP = 38, DOM_VK_DOWN = 40;
					if ((evt.keyCode === 32 || evt.keyCode === 13 || evt.keyCode === 14) && !evt.altKey && !evt.ctrlKey && !evt.metaKey) {
						activate();
						Event.cancel(evt);
					} else if (evt.type === 'click' || evt.keyCode === DOM_VK_DOWN) {
						t.showMenu();
						Event.cancel(evt);
					}
				});
			}

			Event.add(t.id + '_open', 'click', function (evt) {
				t.showMenu();
				Event.cancel(evt);
			});
			Event.add([t.id, t.id + '_open'], 'focus', function() {t._focused = 1;});
			Event.add([t.id, t.id + '_open'], 'blur', function() {t._focused = 0;});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.addClass(t.id, 'mceSplitButtonHover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.removeClass(t.id, 'mceSplitButtonHover');
				});
			}
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_action');
			Event.clear(this.id + '_open');
			Event.clear(this.id);
		}
	});
})(tinymce);

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, is = tinymce.is, each = tinymce.each;

	tinymce.create('tinymce.ui.ColorSplitButton:tinymce.ui.SplitButton', {
		ColorSplitButton : function(id, s, ed) {
			var t = this;

			t.parent(id, s, ed);

			t.settings = s = tinymce.extend({
				colors : '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,008000,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF',
				grid_width : 8,
				default_color : '#888888'
			}, t.settings);

			t.onShowMenu = new tinymce.util.Dispatcher(t);

			t.onHideMenu = new tinymce.util.Dispatcher(t);

			t.value = s.default_color;
		},

		showMenu : function() {
			var t = this, r, p, e, p2;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			e = DOM.get(t.id);
			DOM.show(t.id + '_menu');
			DOM.addClass(e, 'mceSplitButtonSelected');
			p2 = DOM.getPos(e);
			DOM.setStyles(t.id + '_menu', {
				left : p2.x,
				top : p2.y + e.firstChild.clientHeight,
				zIndex : 200000
			});
			e = 0;

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.onShowMenu.dispatch(t);

			if (t._focused) {
				t._keyHandler = Event.add(t.id + '_menu', 'keydown', function(e) {
					if (e.keyCode == 27)
						t.hideMenu();
				});

				DOM.select('a', t.id + '_menu')[0].focus(); // Select first link
			}

			t.keyboardNav = new tinymce.ui.KeyboardNavigation({
				root: t.id + '_menu',
				items: DOM.select('a', t.id + '_menu'),
				onCancel: function() {
					t.hideMenu();
					t.focus();
				}
			});

			t.keyboardNav.focus();
			t.isMenuVisible = 1;
		},

		hideMenu : function(e) {
			var t = this;

			if (t.isMenuVisible) {
				// Prevent double toogles by canceling the mouse click event to the button
				if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id + '_open';}))
					return;

				if (!e || !DOM.getParent(e.target, '.mceSplitButtonMenu')) {
					DOM.removeClass(t.id, 'mceSplitButtonSelected');
					Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
					Event.remove(t.id + '_menu', 'keydown', t._keyHandler);
					DOM.hide(t.id + '_menu');
				}

				t.isMenuVisible = 0;
				t.onHideMenu.dispatch();
				t.keyboardNav.destroy();
			}
		},

		renderMenu : function() {
			var t = this, m, i = 0, s = t.settings, n, tb, tr, w, context;

			w = DOM.add(s.menu_container, 'div', {role: 'listbox', id : t.id + '_menu', 'class' : s.menu_class + ' ' + s['class'], style : 'position:absolute;left:0;top:-1000px;'});
			m = DOM.add(w, 'div', {'class' : s['class'] + ' mceSplitButtonMenu'});
			DOM.add(m, 'span', {'class' : 'mceMenuLine'});

			n = DOM.add(m, 'table', {role: 'presentation', 'class' : 'mceColorSplitMenu'});
			tb = DOM.add(n, 'tbody');

			// Generate color grid
			i = 0;
			each(is(s.colors, 'array') ? s.colors : s.colors.split(','), function(c) {
				c = c.replace(/^#/, '');

				if (!i--) {
					tr = DOM.add(tb, 'tr');
					i = s.grid_width - 1;
				}

				n = DOM.add(tr, 'td');
				var settings = {
					href : 'javascript:;',
					style : {
						backgroundColor : '#' + c
					},
					'title': t.editor.getLang('colors.' + c, c),
					'data-mce-color' : '#' + c
				};

				// adding a proper ARIA role = button causes JAWS to read things incorrectly on IE.
				if (!tinymce.isIE ) {
					settings.role = 'option';
				}

				n = DOM.add(n, 'a', settings);

				if (t.editor.forcedHighContrastMode) {
					n = DOM.add(n, 'canvas', { width: 16, height: 16, 'aria-hidden': 'true' });
					if (n.getContext && (context = n.getContext("2d"))) {
						context.fillStyle = '#' + c;
						context.fillRect(0, 0, 16, 16);
					} else {
						// No point leaving a canvas element around if it's not supported for drawing on anyway.
						DOM.remove(n);
					}
				}
			});

			if (s.more_colors_func) {
				n = DOM.add(tb, 'tr');
				n = DOM.add(n, 'td', {colspan : s.grid_width, 'class' : 'mceMoreColors'});
				n = DOM.add(n, 'a', {role: 'option', id : t.id + '_more', href : 'javascript:;', onclick : 'return false;', 'class' : 'mceMoreColors'}, s.more_colors_title);

				Event.add(n, 'click', function(e) {
					s.more_colors_func.call(s.more_colors_scope || this);
					return Event.cancel(e); // Cancel to fix onbeforeunload problem
				});
			}

			DOM.addClass(m, 'mceColorSplitMenu');

			// Prevent IE from scrolling and hindering click to occur #4019
			Event.add(t.id + '_menu', 'mousedown', function(e) {return Event.cancel(e);});

			Event.add(t.id + '_menu', 'click', function(e) {
				var c;

				e = DOM.getParent(e.target, 'a', tb);

				if (e && e.nodeName.toLowerCase() == 'a' && (c = e.getAttribute('data-mce-color')))
					t.setColor(c);

				return false; // Prevent IE auto save warning
			});

			return w;
		},

		setColor : function(c) {
			this.displayColor(c);
			this.hideMenu();
			this.settings.onselect(c);
		},
		
		displayColor : function(c) {
			var t = this;

			DOM.setStyle(t.id + '_preview', 'backgroundColor', c);

			t.value = c;
		},

		postRender : function() {
			var t = this, id = t.id;

			t.parent();
			DOM.add(id + '_action', 'div', {id : id + '_preview', 'class' : 'mceColorPreview'});
			DOM.setStyle(t.id + '_preview', 'backgroundColor', t.value);
		},

		destroy : function() {
			var self = this;

			self.parent();

			Event.clear(self.id + '_menu');
			Event.clear(self.id + '_more');
			DOM.remove(self.id + '_menu');

			if (self.keyboardNav) {
				self.keyboardNav.destroy();
			}
		}
	});
})(tinymce);

(function(tinymce) {
// Shorten class names
var dom = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event;
tinymce.create('tinymce.ui.ToolbarGroup:tinymce.ui.Container', {
	renderHTML : function() {
		var t = this, h = [], controls = t.controls, each = tinymce.each, settings = t.settings;

		h.push('<div id="' + t.id + '" role="group" aria-labelledby="' + t.id + '_voice">');
		//TODO: ACC test this out - adding a role = application for getting the landmarks working well.
		h.push("<span role='application'>");
		h.push('<span id="' + t.id + '_voice" class="mceVoiceLabel" style="display:none;">' + dom.encode(settings.name) + '</span>');
		each(controls, function(toolbar) {
			h.push(toolbar.renderHTML());
		});
		h.push("</span>");
		h.push('</div>');

		return h.join('');
	},
	
	focus : function() {
		var t = this;
		dom.get(t.id).focus();
	},
	
	postRender : function() {
		var t = this, items = [];

		each(t.controls, function(toolbar) {
			each (toolbar.controls, function(control) {
				if (control.id) {
					items.push(control);
				}
			});
		});

		t.keyNav = new tinymce.ui.KeyboardNavigation({
			root: t.id,
			items: items,
			onCancel: function() {
				//Move focus if webkit so that navigation back will read the item.
				if (tinymce.isWebKit) {
					dom.get(t.editor.id+"_ifr").focus();
				}
				t.editor.focus();
			},
			excludeFromTabOrder: !t.settings.tab_focus_toolbar
		});
	},
	
	destroy : function() {
		var self = this;

		self.parent();
		self.keyNav.destroy();
		Event.clear(self.id);
	}
});
})(tinymce);

(function(tinymce) {
// Shorten class names
var dom = tinymce.DOM, each = tinymce.each;
tinymce.create('tinymce.ui.Toolbar:tinymce.ui.Container', {
	renderHTML : function() {
		var t = this, h = '', c, co, s = t.settings, i, pr, nx, cl;

		cl = t.controls;
		for (i=0; i<cl.length; i++) {
			// Get current control, prev control, next control and if the control is a list box or not
			co = cl[i];
			pr = cl[i - 1];
			nx = cl[i + 1];

			// Add toolbar start
			if (i === 0) {
				c = 'mceToolbarStart';

				if (co.Button)
					c += ' mceToolbarStartButton';
				else if (co.SplitButton)
					c += ' mceToolbarStartSplitButton';
				else if (co.ListBox)
					c += ' mceToolbarStartListBox';

				h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Add toolbar end before list box and after the previous button
			// This is to fix the o2k7 editor skins
			if (pr && co.ListBox) {
				if (pr.Button || pr.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarEnd'}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Render control HTML

			// IE 8 quick fix, needed to propertly generate a hit area for anchors
			if (dom.stdMode)
				h += '<td style="position: relative">' + co.renderHTML() + '</td>';
			else
				h += '<td>' + co.renderHTML() + '</td>';

			// Add toolbar start after list box and before the next button
			// This is to fix the o2k7 editor skins
			if (nx && co.ListBox) {
				if (nx.Button || nx.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}

		c = 'mceToolbarEnd';

		if (co.Button)
			c += ' mceToolbarEndButton';
		else if (co.SplitButton)
			c += ' mceToolbarEndSplitButton';
		else if (co.ListBox)
			c += ' mceToolbarEndListBox';

		h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));

		return dom.createHTML('table', {id : t.id, 'class' : 'mceToolbar' + (s['class'] ? ' ' + s['class'] : ''), cellpadding : '0', cellspacing : '0', align : t.settings.align || '', role: 'presentation', tabindex: '-1'}, '<tbody><tr>' + h + '</tr></tbody>');
	}
});
})(tinymce);

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each;

	tinymce.create('tinymce.AddOnManager', {
		AddOnManager : function() {
			var self = this;

			self.items = [];
			self.urls = {};
			self.lookup = {};
			self.onAdd = new Dispatcher(self);
		},

		get : function(n) {
			if (this.lookup[n]) {
				return this.lookup[n].instance;
			} else {
				return undefined;
			}
		},

		dependencies : function(n) {
			var result;
			if (this.lookup[n]) {
				result = this.lookup[n].dependencies;
			}
			return result || [];
		},

		requireLangPack : function(n) {
			var s = tinymce.settings;

			if (s && s.language && s.language_load !== false)
				tinymce.ScriptLoader.add(this.urls[n] + '/langs/' + s.language + '.js');
		},

		add : function(id, o, dependencies) {
			this.items.push(o);
			this.lookup[id] = {instance:o, dependencies:dependencies};
			this.onAdd.dispatch(this, id, o);

			return o;
		},
		createUrl: function(baseUrl, dep) {
			if (typeof dep === "object") {
				return dep
			} else {
				return {prefix: baseUrl.prefix, resource: dep, suffix: baseUrl.suffix};
			}
		},

		addComponents: function(pluginName, scripts) {
			var pluginUrl = this.urls[pluginName];
			tinymce.each(scripts, function(script){
				tinymce.ScriptLoader.add(pluginUrl+"/"+script);	
			});
		},

		load : function(n, u, cb, s) {
			var t = this, url = u;

			function loadDependencies() {
				var dependencies = t.dependencies(n);
				tinymce.each(dependencies, function(dep) {
					var newUrl = t.createUrl(u, dep);
					t.load(newUrl.resource, newUrl, undefined, undefined);
				});
				if (cb) {
					if (s) {
						cb.call(s);
					} else {
						cb.call(tinymce.ScriptLoader);
					}
				}
			}

			if (t.urls[n])
				return;
			if (typeof u === "object")
				url = u.prefix + u.resource + u.suffix;

			if (url.indexOf('/') !== 0 && url.indexOf('://') == -1)
				url = tinymce.baseURL + '/' + url;

			t.urls[n] = url.substring(0, url.lastIndexOf('/'));

			if (t.lookup[n]) {
				loadDependencies();
			} else {
				tinymce.ScriptLoader.add(url, loadDependencies, s);
			}
		}
	});

	// Create plugin and theme managers
	tinymce.PluginManager = new tinymce.AddOnManager();
	tinymce.ThemeManager = new tinymce.AddOnManager();
}(tinymce));

(function(tinymce) {
	// Shorten names
	var each = tinymce.each, extend = tinymce.extend,
		DOM = tinymce.DOM, Event = tinymce.dom.Event,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		explode = tinymce.explode,
		Dispatcher = tinymce.util.Dispatcher, undef, instanceCounter = 0;

	// Setup some URLs where the editor API is located and where the document is
	tinymce.documentBaseURL = window.location.href.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');
	if (!/[\/\\]$/.test(tinymce.documentBaseURL))
		tinymce.documentBaseURL += '/';

	tinymce.baseURL = new tinymce.util.URI(tinymce.documentBaseURL).toAbsolute(tinymce.baseURL);

	tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);

	// Add before unload listener
	// This was required since IE was leaking memory if you added and removed beforeunload listeners
	// with attachEvent/detatchEvent so this only adds one listener and instances can the attach to the onBeforeUnload event
	tinymce.onBeforeUnload = new Dispatcher(tinymce);

	// Must be on window or IE will leak if the editor is placed in frame or iframe
	Event.add(window, 'beforeunload', function(e) {
		tinymce.onBeforeUnload.dispatch(tinymce, e);
	});

	tinymce.onAddEditor = new Dispatcher(tinymce);

	tinymce.onRemoveEditor = new Dispatcher(tinymce);

	tinymce.EditorManager = extend(tinymce, {
		editors : [],

		i18n : {},

		activeEditor : null,

		init : function(s) {
			var t = this, pl, sl = tinymce.ScriptLoader, e, el = [], ed;

			function createId(elm) {
				var id = elm.id;
	
				// Use element id, or unique name or generate a unique id
				if (!id) {
					id = elm.name;
	
					if (id && !DOM.get(id)) {
						id = elm.name;
					} else {
						// Generate unique name
						id = DOM.uniqueId();
					}

					elm.setAttribute('id', id);
				}

				return id;
			};

			function execCallback(se, n, s) {
				var f = se[n];

				if (!f)
					return;

				if (tinymce.is(f, 'string')) {
					s = f.replace(/\.\w+$/, '');
					s = s ? tinymce.resolve(s) : 0;
					f = tinymce.resolve(f);
				}

				return f.apply(s || this, Array.prototype.slice.call(arguments, 2));
			};

			function hasClass(n, c) {
				return c.constructor === RegExp ? c.test(n.className) : DOM.hasClass(n, c);
			};

			t.settings = s;

			// Legacy call
			Event.bind(window, 'ready', function() {
				var l, co;

				execCallback(s, 'onpageload');

				switch (s.mode) {
					case "exact":
						l = s.elements || '';

						if(l.length > 0) {
							each(explode(l), function(v) {
								if (DOM.get(v)) {
									ed = new tinymce.Editor(v, s);
									el.push(ed);
									ed.render(1);
								} else {
									each(document.forms, function(f) {
										each(f.elements, function(e) {
											if (e.name === v) {
												v = 'mce_editor_' + instanceCounter++;
												DOM.setAttrib(e, 'id', v);

												ed = new tinymce.Editor(v, s);
												el.push(ed);
												ed.render(1);
											}
										});
									});
								}
							});
						}
						break;

					case "textareas":
					case "specific_textareas":
						each(DOM.select('textarea'), function(elm) {
							if (s.editor_deselector && hasClass(elm, s.editor_deselector))
								return;

							if (!s.editor_selector || hasClass(elm, s.editor_selector)) {
								ed = new tinymce.Editor(createId(elm), s);
								el.push(ed);
								ed.render(1);
							}
						});
						break;
					
					default:
						if (s.types) {
							// Process type specific selector
							each(s.types, function(type) {
								each(DOM.select(type.selector), function(elm) {
									var editor = new tinymce.Editor(createId(elm), tinymce.extend({}, s, type));
									el.push(editor);
									editor.render(1);
								});
							});
						} else if (s.selector) {
							// Process global selector
							each(DOM.select(s.selector), function(elm) {
								var editor = new tinymce.Editor(createId(elm), s);
								el.push(editor);
								editor.render(1);
							});
						}
				}

				// Call onInit when all editors are initialized
				if (s.oninit) {
					l = co = 0;

					each(el, function(ed) {
						co++;

						if (!ed.initialized) {
							// Wait for it
							ed.onInit.add(function() {
								l++;

								// All done
								if (l == co)
									execCallback(s, 'oninit');
							});
						} else
							l++;

						// All done
						if (l == co)
							execCallback(s, 'oninit');					
					});
				}
			});
		},

		get : function(id) {
			if (id === undef)
				return this.editors;

			if (!this.editors.hasOwnProperty(id))
				return undef;

			return this.editors[id];
		},

		getInstanceById : function(id) {
			return this.get(id);
		},

		add : function(editor) {
			var self = this, editors = self.editors;

			// Add named and index editor instance
			editors[editor.id] = editor;
			editors.push(editor);

			self._setActive(editor);
			self.onAddEditor.dispatch(self, editor);


			// Patch the tinymce.Editor instance with jQuery adapter logic
			if (tinymce.adapter)
				tinymce.adapter.patchEditor(editor);


			return editor;
		},

		remove : function(editor) {
			var t = this, i, editors = t.editors;

			// Not in the collection
			if (!editors[editor.id])
				return null;

			delete editors[editor.id];

			for (i = 0; i < editors.length; i++) {
				if (editors[i] == editor) {
					editors.splice(i, 1);
					break;
				}
			}

			// Select another editor since the active one was removed
			if (t.activeEditor == editor)
				t._setActive(editors[0]);

			editor.destroy();
			t.onRemoveEditor.dispatch(t, editor);

			return editor;
		},

		execCommand : function(c, u, v) {
			var t = this, ed = t.get(v), w;

			function clr() {
				ed.destroy();
				w.detachEvent('onunload', clr);
				w = w.tinyMCE = w.tinymce = null; // IE leak
			};

			// Manager commands
			switch (c) {
				case "mceFocus":
					ed.focus();
					return true;

				case "mceAddEditor":
				case "mceAddControl":
					if (!t.get(v))
						new tinymce.Editor(v, t.settings).render();

					return true;

				case "mceAddFrameControl":
					w = v.window;

					// Add tinyMCE global instance and tinymce namespace to specified window
					w.tinyMCE = tinyMCE;
					w.tinymce = tinymce;

					tinymce.DOM.doc = w.document;
					tinymce.DOM.win = w;

					ed = new tinymce.Editor(v.element_id, v);
					ed.render();

					// Fix IE memory leaks
					if (tinymce.isIE) {
						w.attachEvent('onunload', clr);
					}

					v.page_window = null;

					return true;

				case "mceRemoveEditor":
				case "mceRemoveControl":
					if (ed)
						ed.remove();

					return true;

				case 'mceToggleEditor':
					if (!ed) {
						t.execCommand('mceAddControl', 0, v);
						return true;
					}

					if (ed.isHidden())
						ed.show();
					else
						ed.hide();

					return true;
			}

			// Run command on active editor
			if (t.activeEditor)
				return t.activeEditor.execCommand(c, u, v);

			return false;
		},

		execInstanceCommand : function(id, c, u, v) {
			var ed = this.get(id);

			if (ed)
				return ed.execCommand(c, u, v);

			return false;
		},

		triggerSave : function() {
			each(this.editors, function(e) {
				e.save();
			});
		},

		addI18n : function(p, o) {
			var lo, i18n = this.i18n;

			if (!tinymce.is(p, 'string')) {
				each(p, function(o, lc) {
					each(o, function(o, g) {
						each(o, function(o, k) {
							if (g === 'common')
								i18n[lc + '.' + k] = o;
							else
								i18n[lc + '.' + g + '.' + k] = o;
						});
					});
				});
			} else {
				each(o, function(o, k) {
					i18n[p + '.' + k] = o;
				});
			}
		},

		// Private methods

		_setActive : function(editor) {
			this.selectedInstance = this.activeEditor = editor;
		}
	});
})(tinymce);

(function(tinymce) {
	// Shorten these names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend,
		each = tinymce.each, isGecko = tinymce.isGecko,
		isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, is = tinymce.is,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		explode = tinymce.explode;

	tinymce.create('tinymce.Editor', {
		Editor : function(id, settings) {
			var self = this, TRUE = true;

			self.settings = settings = extend({
				id : id,
				language : 'en',
				theme : 'advanced',
				skin : 'default',
				delta_width : 0,
				delta_height : 0,
				popup_css : '',
				plugins : '',
				document_base_url : tinymce.documentBaseURL,
				add_form_submit_trigger : TRUE,
				submit_patch : TRUE,
				add_unload_trigger : TRUE,
				convert_urls : TRUE,
				relative_urls : TRUE,
				remove_script_host : TRUE,
				table_inline_editing : false,
				object_resizing : TRUE,
				accessibility_focus : TRUE,
				doctype : tinymce.isIE6 ? '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' : '<!DOCTYPE>', // Use old doctype on IE 6 to avoid horizontal scroll
				visual : TRUE,
				font_size_style_values : 'xx-small,x-small,small,medium,large,x-large,xx-large',
				font_size_legacy_values : 'xx-small,small,medium,large,x-large,xx-large,300%', // See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
				apply_source_formatting : TRUE,
				directionality : 'ltr',
				forced_root_block : 'p',
				hidden_input : TRUE,
				padd_empty_editor : TRUE,
				render_ui : TRUE,
				indentation : '30px',
				fix_table_elements : TRUE,
				inline_styles : TRUE,
				convert_fonts_to_spans : TRUE,
				indent : 'simple',
				indent_before : 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr,section,article,hgroup,aside,figure,option,optgroup,datalist',
				indent_after : 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr,section,article,hgroup,aside,figure,option,optgroup,datalist',
				validate : TRUE,
				entity_encoding : 'named',
				url_converter : self.convertURL,
				url_converter_scope : self,
				ie7_compat : TRUE
			}, settings);

			self.id = self.editorId = id;

			self.isNotDirty = false;

			self.plugins = {};

			self.documentBaseURI = new tinymce.util.URI(settings.document_base_url || tinymce.documentBaseURL, {
				base_uri : tinyMCE.baseURI
			});

			self.baseURI = tinymce.baseURI;

			self.contentCSS = [];

			self.contentStyles = [];

			// Creates all events like onClick, onSetContent etc see Editor.Events.js for the actual logic
			self.setupEvents();

			// Internal command handler objects
			self.execCommands = {};
			self.queryStateCommands = {};
			self.queryValueCommands = {};

			// Call setup
			self.execCallback('setup', self);
		},

		render : function(nst) {
			var t = this, s = t.settings, id = t.id, sl = tinymce.ScriptLoader;

			// Page is not loaded yet, wait for it
			if (!Event.domLoaded) {
				Event.add(window, 'ready', function() {
					t.render();
				});
				return;
			}

			tinyMCE.settings = s;

			// Element not found, then skip initialization
			if (!t.getElement())
				return;

			// Is a iPad/iPhone and not on iOS5, then skip initialization. We need to sniff 
			// here since the browser says it has contentEditable support but there is no visible caret.
			if (tinymce.isIDevice && !tinymce.isIOS5)
				return;

			// Add hidden input for non input elements inside form elements
			if (!/TEXTAREA|INPUT/i.test(t.getElement().nodeName) && s.hidden_input && DOM.getParent(id, 'form'))
				DOM.insertAfter(DOM.create('input', {type : 'hidden', name : id}), id);

			// Hide target element early to prevent content flashing
			if (!s.content_editable) {
				t.orgVisibility = t.getElement().style.visibility;
				t.getElement().style.visibility = 'hidden';
			}

			if (tinymce.WindowManager)
				t.windowManager = new tinymce.WindowManager(t);

			if (s.encoding == 'xml') {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = DOM.encode(o.content);
				});
			}

			if (s.add_form_submit_trigger) {
				t.onSubmit.addToTop(function() {
					if (t.initialized) {
						t.save();
						t.isNotDirty = 1;
					}
				});
			}

			if (s.add_unload_trigger) {
				t._beforeUnload = tinyMCE.onBeforeUnload.add(function() {
					if (t.initialized && !t.destroyed && !t.isHidden())
						t.save({format : 'raw', no_events : true});
				});
			}

			tinymce.addUnload(t.destroy, t);

			if (s.submit_patch) {
				t.onBeforeRenderUI.add(function() {
					var n = t.getElement().form;

					if (!n)
						return;

					// Already patched
					if (n._mceOldSubmit)
						return;

					// Check page uses id="submit" or name="submit" for it's submit button
					if (!n.submit.nodeType && !n.submit.length) {
						t.formElement = n;
						n._mceOldSubmit = n.submit;
						n.submit = function() {
							// Save all instances
							tinymce.triggerSave();
							t.isNotDirty = 1;

							return t.formElement._mceOldSubmit(t.formElement);
						};
					}

					n = null;
				});
			}

			// Load scripts
			function loadScripts() {
				if (s.language && s.language_load !== false)
					sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				if (s.theme && typeof s.theme != "function" && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				each(explode(s.plugins), function(p) {
					if (p &&!PluginManager.urls[p]) {
						if (p.charAt(0) == '-') {
							p = p.substr(1, p.length);
							var dependencies = PluginManager.dependencies(p);
							each(dependencies, function(dep) {
								var defaultSettings = {prefix:'plugins/', resource: dep, suffix:'/editor_plugin' + tinymce.suffix + '.js'};
								dep = PluginManager.createUrl(defaultSettings, dep);
								PluginManager.load(dep.resource, dep);
							});
						} else {
							// Skip safari plugin, since it is removed as of 3.3b1
							if (p == 'safari') {
								return;
							}
							PluginManager.load(p, {prefix:'plugins/', resource: p, suffix:'/editor_plugin' + tinymce.suffix + '.js'});
						}
					}
				});

				// Init when que is loaded
				sl.loadQueue(function() {
					if (!t.removed)
						t.init();
				});
			};

			loadScripts();
		},

		init : function() {
			var n, t = this, s = t.settings, w, h, mh, e = t.getElement(), o, ti, u, bi, bc, re, i, initializedPlugins = [];

			tinymce.add(t);

			s.aria_label = s.aria_label || DOM.getAttrib(e, 'aria-label', t.getLang('aria.rich_text_area'));

			if (s.theme) {
				if (typeof s.theme != "function") {
					s.theme = s.theme.replace(/-/, '');
					o = ThemeManager.get(s.theme);
					t.theme = new o();

					if (t.theme.init)
						t.theme.init(t, ThemeManager.urls[s.theme] || tinymce.documentBaseURL.replace(/\/$/, ''));
				} else {
					t.theme = s.theme;
				}
			}

			function initPlugin(p) {
				var c = PluginManager.get(p), u = PluginManager.urls[p] || tinymce.documentBaseURL.replace(/\/$/, ''), po;
				if (c && tinymce.inArray(initializedPlugins,p) === -1) {
					each(PluginManager.dependencies(p), function(dep){
						initPlugin(dep);
					});
					po = new c(t, u);

					t.plugins[p] = po;

					if (po.init) {
						po.init(t, u);
						initializedPlugins.push(p);
					}
				}
			}
			
			// Create all plugins
			each(explode(s.plugins.replace(/\-/g, '')), initPlugin);

			// Setup popup CSS path(s)
			if (s.popup_css !== false) {
				if (s.popup_css)
					s.popup_css = t.documentBaseURI.toAbsolute(s.popup_css);
				else
					s.popup_css = t.baseURI.toAbsolute("themes/" + s.theme + "/skins/" + s.skin + "/dialog.css");
			}

			if (s.popup_css_add)
				s.popup_css += ',' + t.documentBaseURI.toAbsolute(s.popup_css_add);

			t.controlManager = new tinymce.ControlManager(t);

			// Enables users to override the control factory
			t.onBeforeRenderUI.dispatch(t, t.controlManager);

			// Measure box
			if (s.render_ui && t.theme) {
				t.orgDisplay = e.style.display;

				if (typeof s.theme != "function") {
					w = s.width || e.style.width || e.offsetWidth;
					h = s.height || e.style.height || e.offsetHeight;
					mh = s.min_height || 100;
					re = /^[0-9\.]+(|px)$/i;

					if (re.test('' + w))
						w = Math.max(parseInt(w, 10) + (o.deltaWidth || 0), 100);

					if (re.test('' + h))
						h = Math.max(parseInt(h, 10) + (o.deltaHeight || 0), mh);

					// Render UI
					o = t.theme.renderUI({
						targetNode : e,
						width : w,
						height : h,
						deltaWidth : s.delta_width,
						deltaHeight : s.delta_height
					});

					// Resize editor
					DOM.setStyles(o.sizeContainer || o.editorContainer, {
						width : w,
						height : h
					});

					h = (o.iframeHeight || h) + (typeof(h) == 'number' ? (o.deltaHeight || 0) : '');
					if (h < mh)
						h = mh;
				} else {
					o = s.theme(t, e);

					// Convert element type to id:s
					if (o.editorContainer.nodeType) {
						o.editorContainer = o.editorContainer.id = o.editorContainer.id || t.id + "_parent";
					}

					// Convert element type to id:s
					if (o.iframeContainer.nodeType) {
						o.iframeContainer = o.iframeContainer.id = o.iframeContainer.id || t.id + "_iframecontainer";
					}

					// Use specified iframe height or the targets offsetHeight
					h = o.iframeHeight || e.offsetHeight;

					// Store away the selection when it's changed to it can be restored later with a editor.focus() call
					if (isIE) {
						t.onInit.add(function(ed) {
							ed.dom.bind(ed.getBody(), 'beforedeactivate keydown', function() {
								ed.lastIERng = ed.selection.getRng();
							});
						});
					}
				}

				t.editorContainer = o.editorContainer;
			}

			// Load specified content CSS last
			if (s.content_css) {
				each(explode(s.content_css), function(u) {
					t.contentCSS.push(t.documentBaseURI.toAbsolute(u));
				});
			}

			// Load specified content CSS last
			if (s.content_style) {
				t.contentStyles.push(s.content_style);
			}

			// Content editable mode ends here
			if (s.content_editable) {
				e = n = o = null; // Fix IE leak
				return t.initContentBody();
			}

			// User specified a document.domain value
			if (document.domain && location.hostname != document.domain)
				tinymce.relaxedDomain = document.domain;

			t.iframeHTML = s.doctype + '<html><head xmlns="http://www.w3.org/1999/xhtml">';

			// We only need to override paths if we have to
			// IE has a bug where it remove site absolute urls to relative ones if this is specified
			if (s.document_base_url != tinymce.documentBaseURL)
				t.iframeHTML += '<base href="' + t.documentBaseURI.getURI() + '" />';

			// IE8 doesn't support carets behind images setting ie7_compat would force IE8+ to run in IE7 compat mode.
			if (s.ie7_compat)
				t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" />';
			else
				t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=edge" />';

			t.iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			// Load the CSS by injecting them into the HTML this will reduce "flicker"
			for (i = 0; i < t.contentCSS.length; i++) {
				t.iframeHTML += '<link type="text/css" rel="stylesheet" href="' + t.contentCSS[i] + '" />';
			}

			t.contentCSS = [];

			bi = s.body_id || 'tinymce';
			if (bi.indexOf('=') != -1) {
				bi = t.getParam('body_id', '', 'hash');
				bi = bi[t.id] || bi;
			}

			bc = s.body_class || '';
			if (bc.indexOf('=') != -1) {
				bc = t.getParam('body_class', '', 'hash');
				bc = bc[t.id] || '';
			}

			t.iframeHTML += '</head><body id="' + bi + '" class="mceContentBody ' + bc + '" onload="window.parent.tinyMCE.get(\'' + t.id + '\').onLoad.dispatch();"><br></body></html>';

			// Domain relaxing enabled, then set document domain
			if (tinymce.relaxedDomain && (isIE || (tinymce.isOpera && parseFloat(opera.version()) < 11))) {
				// We need to write the contents here in IE since multiple writes messes up refresh button and back button
				u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";var ed = window.parent.tinyMCE.get("' + t.id + '");document.write(ed.iframeHTML);document.close();ed.initContentBody();})()';
			}

			// Create iframe
			// TODO: ACC add the appropriate description on this.
			n = DOM.add(o.iframeContainer, 'iframe', { 
				id : t.id + "_ifr",
				src : u || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder : '0',
				allowTransparency : "true",
				title : s.aria_label,
				style : {
					width : '100%',
					height : h,
					display : 'block' // Important for Gecko to render the iframe correctly
				}
			});

			t.contentAreaContainer = o.iframeContainer;

			if (o.editorContainer) {
				DOM.get(o.editorContainer).style.display = t.orgDisplay;
			}

			// Restore visibility on target element
			e.style.visibility = t.orgVisibility;

			DOM.get(t.id).style.display = 'none';
			DOM.setAttrib(t.id, 'aria-hidden', true);

			if (!tinymce.relaxedDomain || !u)
				t.initContentBody();

			e = n = o = null; // Cleanup
		},

		initContentBody : function() {
			var self = this, settings = self.settings, targetElm = DOM.get(self.id), doc = self.getDoc(), html, body, contentCssText;

			// Setup iframe body
			if ((!isIE || !tinymce.relaxedDomain) && !settings.content_editable) {
				doc.open();
				doc.write(self.iframeHTML);
				doc.close();

				if (tinymce.relaxedDomain)
					doc.domain = tinymce.relaxedDomain;
			}

			if (settings.content_editable) {
				DOM.addClass(targetElm, 'mceContentBody');
				self.contentDocument = doc = settings.content_document || document;
				self.contentWindow = settings.content_window || window;
				self.bodyElement = targetElm;

				// Prevent leak in IE
				settings.content_document = settings.content_window = null;
			}

			// It will not steal focus while setting contentEditable
			body = self.getBody();
			body.disabled = true;

			if (!settings.readonly)
				body.contentEditable = self.getParam('content_editable_state', true);

			body.disabled = false;

			self.schema = new tinymce.html.Schema(settings);

			self.dom = new tinymce.dom.DOMUtils(doc, {
				keep_values : true,
				url_converter : self.convertURL,
				url_converter_scope : self,
				hex_colors : settings.force_hex_style_colors,
				class_filter : settings.class_filter,
				update_styles : true,
				root_element : settings.content_editable ? self.id : null,
				schema : self.schema
			});

			self.parser = new tinymce.html.DomParser(settings, self.schema);

			// Convert src and href into data-mce-src, data-mce-href and data-mce-style
			self.parser.addAttributeFilter('src,href,style', function(nodes, name) {
				var i = nodes.length, node, dom = self.dom, value, internalName;

				while (i--) {
					node = nodes[i];
					value = node.attr(name);
					internalName = 'data-mce-' + name;

					// Add internal attribute if we need to we don't on a refresh of the document
					if (!node.attributes.map[internalName]) {	
						if (name === "style")
							node.attr(internalName, dom.serializeStyle(dom.parseStyle(value), node.name));
						else
							node.attr(internalName, self.convertURL(value, name, node.name));
					}
				}
			});

			// Keep scripts from executing
			self.parser.addNodeFilter('script', function(nodes, name) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.attr('type', 'mce-' + (node.attr('type') || 'text/javascript'));
				}
			});

			self.parser.addNodeFilter('#cdata', function(nodes, name) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.type = 8;
					node.name = '#comment';
					node.value = '[CDATA[' + node.value + ']]';
				}
			});

			self.parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function(nodes, name) {
				var i = nodes.length, node, nonEmptyElements = self.schema.getNonEmptyElements();

				while (i--) {
					node = nodes[i];

					if (node.isEmpty(nonEmptyElements))
						node.empty().append(new tinymce.html.Node('br', 1)).shortEnded = true;
				}
			});

			self.serializer = new tinymce.dom.Serializer(settings, self.dom, self.schema);

			self.selection = new tinymce.dom.Selection(self.dom, self.getWin(), self.serializer, self);

			self.formatter = new tinymce.Formatter(self);

			self.undoManager = new tinymce.UndoManager(self);

			self.forceBlocks = new tinymce.ForceBlocks(self);
			self.enterKey = new tinymce.EnterKey(self);
			self.editorCommands = new tinymce.EditorCommands(self);

			self.onExecCommand.add(function(editor, command) {
				// Don't refresh the select lists until caret move
				if (!/^(FontName|FontSize)$/.test(command))
					self.nodeChanged();
			});

			// Pass through
			self.serializer.onPreProcess.add(function(se, o) {
				return self.onPreProcess.dispatch(self, o, se);
			});

			self.serializer.onPostProcess.add(function(se, o) {
				return self.onPostProcess.dispatch(self, o, se);
			});

			self.onPreInit.dispatch(self);

			if (!settings.browser_spellcheck && !settings.gecko_spellcheck)
				doc.body.spellcheck = false;

			if (!settings.readonly) {
				self.bindNativeEvents();
			}

			self.controlManager.onPostRender.dispatch(self, self.controlManager);
			self.onPostRender.dispatch(self);

			self.quirks = tinymce.util.Quirks(self);

			if (settings.directionality)
				body.dir = settings.directionality;

			if (settings.nowrap)
				body.style.whiteSpace = "nowrap";

			if (settings.protect) {
				self.onBeforeSetContent.add(function(ed, o) {
					each(settings.protect, function(pattern) {
						o.content = o.content.replace(pattern, function(str) {
							return '<!--mce:protected ' + escape(str) + '-->';
						});
					});
				});
			}

			// Add visual aids when new contents is added
			self.onSetContent.add(function() {
				self.addVisual(self.getBody());
			});

			// Remove empty contents
			if (settings.padd_empty_editor) {
				self.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			self.load({initial : true, format : 'html'});
			self.startContent = self.getContent({format : 'raw'});

			self.initialized = true;

			self.onInit.dispatch(self);
			self.execCallback('setupcontent_callback', self.id, body, doc);
			self.execCallback('init_instance_callback', self);
			self.focus(true);
			self.nodeChanged({initial : true});

			// Add editor specific CSS styles
			if (self.contentStyles.length > 0) {
				contentCssText = '';

				each(self.contentStyles, function(style) {
					contentCssText += style + "\r\n";
				});

				self.dom.addStyle(contentCssText);
			}

			// Load specified content CSS last
			each(self.contentCSS, function(url) {
				self.dom.loadCSS(url);
			});

			// Handle auto focus
			if (settings.auto_focus) {
				setTimeout(function () {
					var ed = tinymce.get(settings.auto_focus);

					ed.selection.select(ed.getBody(), 1);
					ed.selection.collapse(1);
					ed.getBody().focus();
					ed.getWin().focus();
				}, 100);
			}

			// Clean up references for IE
			targetElm = doc = body = null;
		},

		focus : function(skip_focus) {
			var oed, self = this, selection = self.selection, contentEditable = self.settings.content_editable, ieRng, controlElm, doc = self.getDoc(), body;

			if (!skip_focus) {
				if (self.lastIERng) {
					selection.setRng(self.lastIERng);
				}

				// Get selected control element
				ieRng = selection.getRng();
				if (ieRng.item) {
					controlElm = ieRng.item(0);
				}

				self._refreshContentEditable();

				// Focus the window iframe
				if (!contentEditable) {
					self.getWin().focus();
				}

				// Focus the body as well since it's contentEditable
				if (tinymce.isGecko || contentEditable) {
					body = self.getBody();

					// Check for setActive since it doesn't scroll to the element
					if (body.setActive) {
						body.setActive();
					} else {
						body.focus();
					}

					if (contentEditable) {
						selection.normalize();
					}
				}

				// Restore selected control element
				// This is needed when for example an image is selected within a
				// layer a call to focus will then remove the control selection
				if (controlElm && controlElm.ownerDocument == doc) {
					ieRng = doc.body.createControlRange();
					ieRng.addElement(controlElm);
					ieRng.select();
				}
			}

			if (tinymce.activeEditor != self) {
				if ((oed = tinymce.activeEditor) != null)
					oed.onDeactivate.dispatch(oed, self);

				self.onActivate.dispatch(self, oed);
			}

			tinymce._setActive(self);
		},

		execCallback : function(n) {
			var t = this, f = t.settings[n], s;

			if (!f)
				return;

			// Look through lookup
			if (t.callbackLookup && (s = t.callbackLookup[n])) {
				f = s.func;
				s = s.scope;
			}

			if (is(f, 'string')) {
				s = f.replace(/\.\w+$/, '');
				s = s ? tinymce.resolve(s) : 0;
				f = tinymce.resolve(f);
				t.callbackLookup = t.callbackLookup || {};
				t.callbackLookup[n] = {func : f, scope : s};
			}

			return f.apply(s || t, Array.prototype.slice.call(arguments, 1));
		},

		translate : function(s) {
			var c = this.settings.language || 'en', i18n = tinymce.i18n;

			if (!s)
				return '';

			return i18n[c + '.' + s] || s.replace(/\{\#([^\}]+)\}/g, function(a, b) {
				return i18n[c + '.' + b] || '{#' + b + '}';
			});
		},

		getLang : function(n, dv) {
			return tinymce.i18n[(this.settings.language || 'en') + '.' + n] || (is(dv) ? dv : '{#' + n + '}');
		},

		getParam : function(n, dv, ty) {
			var tr = tinymce.trim, v = is(this.settings[n]) ? this.settings[n] : dv, o;

			if (ty === 'hash') {
				o = {};

				if (is(v, 'string')) {
					each(v.indexOf('=') > 0 ? v.split(/[;,](?![^=;,]*(?:[;,]|$))/) : v.split(','), function(v) {
						v = v.split('=');

						if (v.length > 1)
							o[tr(v[0])] = tr(v[1]);
						else
							o[tr(v[0])] = tr(v);
					});
				} else
					o = v;

				return o;
			}

			return v;
		},

		nodeChanged : function(o) {
			var self = this, selection = self.selection, node;

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (self.initialized) {
				o = o || {};

				// Get start node
				node = selection.getStart() || self.getBody();
				node = isIE && node.ownerDocument != self.getDoc() ? self.getBody() : node; // Fix for IE initial state

				// Get parents and add them to object
				o.parents = [];
				self.dom.getParent(node, function(node) {
					if (node.nodeName == 'BODY')
						return true;

					o.parents.push(node);
				});

				self.onNodeChange.dispatch(
					self,
					o ? o.controlManager || self.controlManager : self.controlManager,
					node,
					selection.isCollapsed(),
					o
				);
			}
		},

		addButton : function(name, settings) {
			var self = this;

			self.buttons = self.buttons || {};
			self.buttons[name] = settings;
		},

		addCommand : function(name, callback, scope) {
			this.execCommands[name] = {func : callback, scope : scope || this};
		},

		addQueryStateHandler : function(name, callback, scope) {
			this.queryStateCommands[name] = {func : callback, scope : scope || this};
		},

		addQueryValueHandler : function(name, callback, scope) {
			this.queryValueCommands[name] = {func : callback, scope : scope || this};
		},

		addShortcut : function(pa, desc, cmd_func, sc) {
			var t = this, c;

			if (t.settings.custom_shortcuts === false)
				return false;

			t.shortcuts = t.shortcuts || {};

			if (is(cmd_func, 'string')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c, false, null);
				};
			}

			if (is(cmd_func, 'object')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c[0], c[1], c[2]);
				};
			}

			each(explode(pa), function(pa) {
				var o = {
					func : cmd_func,
					scope : sc || this,
					desc : t.translate(desc),
					alt : false,
					ctrl : false,
					shift : false
				};

				each(explode(pa, '+'), function(v) {
					switch (v) {
						case 'alt':
						case 'ctrl':
						case 'shift':
							o[v] = true;
							break;

						default:
							o.charCode = v.charCodeAt(0);
							o.keyCode = v.toUpperCase().charCodeAt(0);
					}
				});

				t.shortcuts[(o.ctrl ? 'ctrl' : '') + ',' + (o.alt ? 'alt' : '') + ',' + (o.shift ? 'shift' : '') + ',' + o.keyCode] = o;
			});

			return true;
		},

		execCommand : function(cmd, ui, val, a) {
			var t = this, s = 0, o, st;

			if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll)$/.test(cmd) && (!a || !a.skip_focus))
				t.focus();

			a = extend({}, a);
			t.onBeforeExecCommand.dispatch(t, cmd, ui, val, a);
			if (a.terminate)
				return false;

			// Command callback
			if (t.execCallback('execcommand_callback', t.id, t.selection.getNode(), cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Registred commands
			if (o = t.execCommands[cmd]) {
				st = o.func.call(o.scope, ui, val);

				// Fall through on true
				if (st !== true) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					return st;
				}
			}

			// Plugin commands
			each(t.plugins, function(p) {
				if (p.execCommand && p.execCommand(cmd, ui, val)) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					s = 1;
					return false;
				}
			});

			if (s)
				return true;

			// Theme commands
			if (t.theme && t.theme.execCommand && t.theme.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Editor commands
			if (t.editorCommands.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Browser commands
			t.getDoc().execCommand(cmd, ui, val);
			t.onExecCommand.dispatch(t, cmd, ui, val, a);
		},

		queryCommandState : function(cmd) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryStateCommands[cmd]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandState(cmd);
			if (o !== -1)
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandState(cmd);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		queryCommandValue : function(c) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryValueCommands[c]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandValue(c);
			if (is(o))
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandValue(c);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		show : function() {
			var self = this;

			DOM.show(self.getContainer());
			DOM.hide(self.id);
			self.load();
		},

		hide : function() {
			var self = this, doc = self.getDoc();

			// Fixed bug where IE has a blinking cursor left from the editor
			if (isIE && doc)
				doc.execCommand('SelectAll');

			// We must save before we hide so Safari doesn't crash
			self.save();

			// defer the call to hide to prevent an IE9 crash #4921
			setTimeout(function() {
				DOM.hide(self.getContainer());
			}, 1);
			DOM.setStyle(self.id, 'display', self.orgDisplay);
		},

		isHidden : function() {
			return !DOM.isHidden(this.id);
		},

		setProgressState : function(b, ti, o) {
			this.onSetProgressState.dispatch(this, b, ti, o);

			return b;
		},

		load : function(o) {
			var t = this, e = t.getElement(), h;

			if (e) {
				o = o || {};
				o.load = true;

				// Double encode existing entities in the value
				h = t.setContent(is(e.value) ? e.value : e.innerHTML, o);
				o.element = e;

				if (!o.no_events)
					t.onLoadContent.dispatch(t, o);

				o.element = e = null;

				return h;
			}
		},

		save : function(o) {
			var t = this, e = t.getElement(), h, f;

			if (!e || !t.initialized)
				return;

			o = o || {};
			o.save = true;

			o.element = e;
			h = o.content = t.getContent(o);

			if (!o.no_events)
				t.onSaveContent.dispatch(t, o);

			h = o.content;

			if (!/TEXTAREA|INPUT/i.test(e.nodeName)) {
				e.innerHTML = h;

				// Update hidden form element
				if (f = DOM.getParent(t.id, 'form')) {
					each(f.elements, function(e) {
						if (e.name == t.id) {
							e.value = h;
							return false;
						}
					});
				}
			} else
				e.value = h;

			o.element = e = null;

			return h;
		},

		setContent : function(content, args) {
			var self = this, rootNode, body = self.getBody(), forcedRootBlockName;

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.set = true;
			args.content = content;

			// Do preprocessing
			if (!args.no_events)
				self.onBeforeSetContent.dispatch(self, args);

			content = args.content;

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (!tinymce.isIE && (content.length === 0 || /^\s+$/.test(content))) {
				forcedRootBlockName = self.settings.forced_root_block;
				if (forcedRootBlockName)
					content = '<' + forcedRootBlockName + '><br data-mce-bogus="1"></' + forcedRootBlockName + '>';
				else
					content = '<br data-mce-bogus="1">';

				body.innerHTML = content;
				self.selection.select(body, true);
				self.selection.collapse(true);
				return;
			}

			// Parse and serialize the html
			if (args.format !== 'raw') {
				content = new tinymce.html.Serializer({}, self.schema).serialize(
					self.parser.parse(content)
				);
			}

			// Set the new cleaned contents to the editor
			args.content = tinymce.trim(content);
			self.dom.setHTML(body, args.content);

			// Do post processing
			if (!args.no_events)
				self.onSetContent.dispatch(self, args);

			// Don't normalize selection if the focused element isn't the body in content editable mode since it will steal focus otherwise
			if (!self.settings.content_editable || document.activeElement === self.getBody()) {
				self.selection.normalize();
			}

			return args.content;
		},

		getContent : function(args) {
			var self = this, content, body = self.getBody();

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.get = true;
			args.getInner = true;

			// Do preprocessing
			if (!args.no_events)
				self.onBeforeGetContent.dispatch(self, args);

			// Get raw contents or by default the cleaned contents
			if (args.format == 'raw')
				content = body.innerHTML;
			else if (args.format == 'text')
				content = body.innerText || body.textContent;
			else
				content = self.serializer.serialize(body, args);

			// Trim whitespace in beginning/end of HTML
			if (args.format != 'text') {
				args.content = tinymce.trim(content);
			} else {
				args.content = content;
			}

			// Do post processing
			if (!args.no_events)
				self.onGetContent.dispatch(self, args);

			return args.content;
		},

		isDirty : function() {
			var self = this;

			return tinymce.trim(self.startContent) != tinymce.trim(self.getContent({format : 'raw', no_events : 1})) && !self.isNotDirty;
		},

		getContainer : function() {
			var self = this;

			if (!self.container)
				self.container = DOM.get(self.editorContainer || self.id + '_parent');

			return self.container;
		},

		getContentAreaContainer : function() {
			return this.contentAreaContainer;
		},

		getElement : function() {
			return DOM.get(this.settings.content_element || this.id);
		},

		getWin : function() {
			var self = this, elm;

			if (!self.contentWindow) {
				elm = DOM.get(self.id + "_ifr");

				if (elm)
					self.contentWindow = elm.contentWindow;
			}

			return self.contentWindow;
		},

		getDoc : function() {
			var self = this, win;

			if (!self.contentDocument) {
				win = self.getWin();

				if (win)
					self.contentDocument = win.document;
			}

			return self.contentDocument;
		},

		getBody : function() {
			return this.bodyElement || this.getDoc().body;
		},

		convertURL : function(url, name, elm) {
			var self = this, settings = self.settings;

			// Use callback instead
			if (settings.urlconverter_callback)
				return self.execCallback('urlconverter_callback', url, elm, true, name);

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!settings.convert_urls || (elm && elm.nodeName == 'LINK') || url.indexOf('file:') === 0)
				return url;

			// Convert to relative
			if (settings.relative_urls)
				return self.documentBaseURI.toRelative(url);

			// Convert to absolute
			url = self.documentBaseURI.toAbsolute(url, settings.remove_script_host);

			return url;
		},

		addVisual : function(elm) {
			var self = this, settings = self.settings, dom = self.dom, cls;

			elm = elm || self.getBody();

			if (!is(self.hasVisual))
				self.hasVisual = settings.visual;

			each(dom.select('table,a', elm), function(elm) {
				var value;

				switch (elm.nodeName) {
					case 'TABLE':
						cls = settings.visual_table_class || 'mceItemTable';
						value = dom.getAttrib(elm, 'border');

						if (!value || value == '0') {
							if (self.hasVisual)
								dom.addClass(elm, cls);
							else
								dom.removeClass(elm, cls);
						}

						return;

					case 'A':
						if (!dom.getAttrib(elm, 'href', false)) {
							value = dom.getAttrib(elm, 'name') || elm.id;
							cls = 'mceItemAnchor';

							if (value) {
								if (self.hasVisual)
									dom.addClass(elm, cls);
								else
									dom.removeClass(elm, cls);
							}
						}

						return;
				}
			});

			self.onVisualAid.dispatch(self, elm, self.hasVisual);
		},

		remove : function() {
			var self = this, elm = self.getContainer();

			if (!self.removed) {
				self.removed = 1; // Cancels post remove event execution
				self.hide();

				// Don't clear the window or document if content editable
				// is enabled since other instances might still be present
				if (!self.settings.content_editable) {
					Event.unbind(self.getWin());
					Event.unbind(self.getDoc());
				}

				Event.unbind(self.getBody());
				Event.clear(elm);

				self.execCallback('remove_instance_callback', self);
				self.onRemove.dispatch(self);

				// Clear all execCommand listeners this is required to avoid errors if the editor was removed inside another command
				self.onExecCommand.listeners = [];

				tinymce.remove(self);
				DOM.remove(elm);
			}
		},

		destroy : function(s) {
			var t = this;

			// One time is enough
			if (t.destroyed)
				return;

			// We must unbind on Gecko since it would otherwise produce the pesky "attempt to run compile-and-go script on a cleared scope" message
			if (isGecko) {
				Event.unbind(t.getDoc());
				Event.unbind(t.getWin());
				Event.unbind(t.getBody());
			}

			if (!s) {
				tinymce.removeUnload(t.destroy);
				tinyMCE.onBeforeUnload.remove(t._beforeUnload);

				// Manual destroy
				if (t.theme && t.theme.destroy)
					t.theme.destroy();

				// Destroy controls, selection and dom
				t.controlManager.destroy();
				t.selection.destroy();
				t.dom.destroy();
			}

			if (t.formElement) {
				t.formElement.submit = t.formElement._mceOldSubmit;
				t.formElement._mceOldSubmit = null;
			}

			t.contentAreaContainer = t.formElement = t.container = t.settings.content_element = t.bodyElement = t.contentDocument = t.contentWindow = null;

			if (t.selection)
				t.selection = t.selection.win = t.selection.dom = t.selection.dom.doc = null;

			t.destroyed = 1;
		},

		// Internal functions

		_refreshContentEditable : function() {
			var self = this, body, parent;

			// Check if the editor was hidden and the re-initalize contentEditable mode by removing and adding the body again
			if (self._isHidden()) {
				body = self.getBody();
				parent = body.parentNode;

				parent.removeChild(body);
				parent.appendChild(body);

				body.focus();
			}
		},

		_isHidden : function() {
			var s;

			if (!isGecko)
				return 0;

			// Weird, wheres that cursor selection?
			s = this.selection.getSel();
			return (!s || !s.rangeCount || s.rangeCount === 0);
		}
	});
})(tinymce);
(function(tinymce) {
	var each = tinymce.each;

	tinymce.Editor.prototype.setupEvents = function() {
		var self = this, settings = self.settings;

		// Add events to the editor
		each([
			'onPreInit',

			'onBeforeRenderUI',

			'onPostRender',

			'onLoad',

			'onInit',

			'onRemove',

			'onActivate',

			'onDeactivate',

			'onClick',

			'onEvent',

			'onMouseUp',

			'onMouseDown',

			'onDblClick',

			'onKeyDown',

			'onKeyUp',

			'onKeyPress',

			'onContextMenu',

			'onSubmit',

			'onReset',

			'onPaste',

			'onPreProcess',

			'onPostProcess',

			'onBeforeSetContent',

			'onBeforeGetContent',

			'onSetContent',

			'onGetContent',

			'onLoadContent',

			'onSaveContent',

			'onNodeChange',

			'onChange',

			'onBeforeExecCommand',

			'onExecCommand',

			'onUndo',

			'onRedo',

			'onVisualAid',

			'onSetProgressState',

			'onSetAttrib'
		], function(name) {
			self[name] = new tinymce.util.Dispatcher(self);
		});

		// Handle legacy cleanup_callback option
		if (settings.cleanup_callback) {
			self.onBeforeSetContent.add(function(ed, o) {
				o.content = ed.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);
			});

			self.onPreProcess.add(function(ed, o) {
				if (o.set)
					ed.execCallback('cleanup_callback', 'insert_to_editor_dom', o.node, o);

				if (o.get)
					ed.execCallback('cleanup_callback', 'get_from_editor_dom', o.node, o);
			});

			self.onPostProcess.add(function(ed, o) {
				if (o.set)
					o.content = ed.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);

				if (o.get)						
					o.content = ed.execCallback('cleanup_callback', 'get_from_editor', o.content, o);
			});
		}

		// Handle legacy save_callback option
		if (settings.save_callback) {
			self.onGetContent.add(function(ed, o) {
				if (o.save)
					o.content = ed.execCallback('save_callback', ed.id, o.content, ed.getBody());
			});
		}

		// Handle legacy handle_event_callback option
		if (settings.handle_event_callback) {
			self.onEvent.add(function(ed, e, o) {
				if (self.execCallback('handle_event_callback', e, ed, o) === false) {
					e.preventDefault();
					e.stopPropagation();
				}
			});
		}

		// Handle legacy handle_node_change_callback option
		if (settings.handle_node_change_callback) {
			self.onNodeChange.add(function(ed, cm, n) {
				ed.execCallback('handle_node_change_callback', ed.id, n, -1, -1, true, ed.selection.isCollapsed());
			});
		}

		// Handle legacy save_callback option
		if (settings.save_callback) {
			self.onSaveContent.add(function(ed, o) {
				var h = ed.execCallback('save_callback', ed.id, o.content, ed.getBody());

				if (h)
					o.content = h;
			});
		}

		// Handle legacy onchange_callback option
		if (settings.onchange_callback) {
			self.onChange.add(function(ed, l) {
				ed.execCallback('onchange_callback', ed, l);
			});
		}
	};

	tinymce.Editor.prototype.bindNativeEvents = function() {
		// 'focus', 'blur', 'dblclick', 'beforedeactivate', submit, reset
		var self = this, i, settings = self.settings, dom = self.dom, nativeToDispatcherMap;

		nativeToDispatcherMap = {
			mouseup : 'onMouseUp',
			mousedown : 'onMouseDown',
			click : 'onClick',
			keyup : 'onKeyUp',
			keydown : 'onKeyDown',
			keypress : 'onKeyPress',
			submit : 'onSubmit',
			reset : 'onReset',
			contextmenu : 'onContextMenu',
			dblclick : 'onDblClick',
			paste : 'onPaste' // Doesn't work in all browsers yet
		};

		// Handler that takes a native event and sends it out to a dispatcher like onKeyDown
		function eventHandler(evt, args) {
			var type = evt.type;

			// Don't fire events when it's removed
			if (self.removed)
				return;

			// Sends the native event out to a global dispatcher then to the specific event dispatcher
			if (self.onEvent.dispatch(self, evt, args) !== false) {
				self[nativeToDispatcherMap[evt.fakeType || evt.type]].dispatch(self, evt, args);
			}
		};

		// Opera doesn't support focus event for contentEditable elements so we need to fake it
		function doOperaFocus(e) {
			self.focus(true);
		};

		function nodeChanged(ed, e) {
			// Normalize selection for example <b>a</b><i>|a</i> becomes <b>a|</b><i>a</i> except for Ctrl+A since it selects everything
			if (e.keyCode != 65 || !tinymce.VK.metaKeyPressed(e)) {
				self.selection.normalize();
			}

			self.nodeChanged();
		}

		// Add DOM events
		each(nativeToDispatcherMap, function(dispatcherName, nativeName) {
			var root = settings.content_editable ? self.getBody() : self.getDoc();

			switch (nativeName) {
				case 'contextmenu':
					dom.bind(root, nativeName, eventHandler);
					break;

				case 'paste':
					dom.bind(self.getBody(), nativeName, eventHandler);
					break;

				case 'submit':
				case 'reset':
					dom.bind(self.getElement().form || tinymce.DOM.getParent(self.id, 'form'), nativeName, eventHandler);
					break;

				default:
					dom.bind(root, nativeName, eventHandler);
			}
		});

		// Set the editor as active when focused
		dom.bind(settings.content_editable ? self.getBody() : (tinymce.isGecko ? self.getDoc() : self.getWin()), 'focus', function(e) {
			self.focus(true);
		});

		if (settings.content_editable && tinymce.isOpera) {
			dom.bind(self.getBody(), 'click', doOperaFocus);
			dom.bind(self.getBody(), 'keydown', doOperaFocus);
		}

		// Add node change handler
		self.onMouseUp.add(nodeChanged);

		self.onKeyUp.add(function(ed, e) {
			var keyCode = e.keyCode;

			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 13 || keyCode == 45 || keyCode == 46 || keyCode == 8 || (tinymce.isMac && (keyCode == 91 || keyCode == 93)) || e.ctrlKey)
				nodeChanged(ed, e);
		});

		// Add reset handler
		self.onReset.add(function() {
			self.setContent(self.startContent, {format : 'raw'});
		});

		// Add shortcuts
		function handleShortcut(e, execute) {
			if (e.altKey || e.ctrlKey || e.metaKey) {
				each(self.shortcuts, function(shortcut) {
					var ctrlState = tinymce.isMac ? e.metaKey : e.ctrlKey;

					if (shortcut.ctrl != ctrlState || shortcut.alt != e.altKey || shortcut.shift != e.shiftKey)
						return;

					if (e.keyCode == shortcut.keyCode || (e.charCode && e.charCode == shortcut.charCode)) {
						e.preventDefault();

						if (execute) {
							shortcut.func.call(shortcut.scope);
						}

						return true;
					}
				});
			}
		};

		self.onKeyUp.add(function(ed, e) {
			handleShortcut(e);
		});

		self.onKeyPress.add(function(ed, e) {
			handleShortcut(e);
		});

		self.onKeyDown.add(function(ed, e) {
			handleShortcut(e, true);
		});

		if (tinymce.isOpera) {
			self.onClick.add(function(ed, e) {
				e.preventDefault();
			});
		}
	};
})(tinymce);
(function(tinymce) {
	// Added for compression purposes
	var each = tinymce.each, undef, TRUE = true, FALSE = false;

	tinymce.EditorCommands = function(editor) {
		var dom = editor.dom,
			selection = editor.selection,
			commands = {state: {}, exec : {}, value : {}},
			settings = editor.settings,
			formatter = editor.formatter,
			bookmark;

		function execCommand(command, ui, value) {
			var func;

			command = command.toLowerCase();
			if (func = commands.exec[command]) {
				func(command, ui, value);
				return TRUE;
			}

			return FALSE;
		};

		function queryCommandState(command) {
			var func;

			command = command.toLowerCase();
			if (func = commands.state[command])
				return func(command);

			return -1;
		};

		function queryCommandValue(command) {
			var func;

			command = command.toLowerCase();
			if (func = commands.value[command])
				return func(command);

			return FALSE;
		};

		function addCommands(command_list, type) {
			type = type || 'exec';

			each(command_list, function(callback, command) {
				each(command.toLowerCase().split(','), function(command) {
					commands[type][command] = callback;
				});
			});
		};

		// Expose public methods
		tinymce.extend(this, {
			execCommand : execCommand,
			queryCommandState : queryCommandState,
			queryCommandValue : queryCommandValue,
			addCommands : addCommands
		});

		// Private methods

		function execNativeCommand(command, ui, value) {
			if (ui === undef)
				ui = FALSE;

			if (value === undef)
				value = null;

			return editor.getDoc().execCommand(command, ui, value);
		};

		function isFormatMatch(name) {
			return formatter.match(name);
		};

		function toggleFormat(name, value) {
			formatter.toggle(name, value ? {value : value} : undef);
		};

		function storeSelection(type) {
			bookmark = selection.getBookmark(type);
		};

		function restoreSelection() {
			selection.moveToBookmark(bookmark);
		};

		// Add execCommand overrides
		addCommands({
			// Ignore these, added for compatibility
			'mceResetDesignMode,mceBeginUndoLevel' : function() {},

			// Add undo manager logic
			'mceEndUndoLevel,mceAddUndoLevel' : function() {
				editor.undoManager.add();
			},

			'Cut,Copy,Paste' : function(command) {
				var doc = editor.getDoc(), failed;

				// Try executing the native command
				try {
					execNativeCommand(command);
				} catch (ex) {
					// Command failed
					failed = TRUE;
				}

				// Present alert message about clipboard access not being available
				if (failed || !doc.queryCommandSupported(command)) {
					if (tinymce.isGecko) {
						editor.windowManager.confirm(editor.getLang('clipboard_msg'), function(state) {
							if (state)
								open('http://www.mozilla.org/editor/midasdemo/securityprefs.html', '_blank');
						});
					} else
						editor.windowManager.alert(editor.getLang('clipboard_no_support'));
				}
			},

			// Override unlink command
			unlink : function(command) {
				if (selection.isCollapsed())
					selection.select(selection.getNode());

				execNativeCommand(command);
				selection.collapse(FALSE);
			},

			// Override justify commands to use the text formatter engine
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull' : function(command) {
				var align = command.substring(7);

				// Remove all other alignments first
				each('left,center,right,full'.split(','), function(name) {
					if (align != name)
						formatter.remove('align' + name);
				});

				toggleFormat('align' + align);
				execCommand('mceRepaint');
			},

			// Override list commands to fix WebKit bug
			'InsertUnorderedList,InsertOrderedList' : function(command) {
				var listElm, listParent;

				execNativeCommand(command);

				// WebKit produces lists within block elements so we need to split them
				// we will replace the native list creation logic to custom logic later on
				// TODO: Remove this when the list creation logic is removed
				listElm = dom.getParent(selection.getNode(), 'ol,ul');
				if (listElm) {
					listParent = listElm.parentNode;

					// If list is within a text block then split that block
					if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
						storeSelection();
						dom.split(listParent, listElm);
						restoreSelection();
					}
				}
			},

			// Override commands to use the text formatter engine
			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript' : function(command) {
				toggleFormat(command);
			},

			// Override commands to use the text formatter engine
			'ForeColor,HiliteColor,FontName' : function(command, ui, value) {
				toggleFormat(command, value);
			},

			FontSize : function(command, ui, value) {
				var fontClasses, fontSizes;

				// Convert font size 1-7 to styles
				if (value >= 1 && value <= 7) {
					fontSizes = tinymce.explode(settings.font_size_style_values);
					fontClasses = tinymce.explode(settings.font_size_classes);

					if (fontClasses)
						value = fontClasses[value - 1] || value;
					else
						value = fontSizes[value - 1] || value;
				}

				toggleFormat(command, value);
			},

			RemoveFormat : function(command) {
				formatter.remove(command);
			},

			mceBlockQuote : function(command) {
				toggleFormat('blockquote');
			},

			FormatBlock : function(command, ui, value) {
				return toggleFormat(value || 'p');
			},

			mceCleanup : function() {
				var bookmark = selection.getBookmark();

				editor.setContent(editor.getContent({cleanup : TRUE}), {cleanup : TRUE});

				selection.moveToBookmark(bookmark);
			},

			mceRemoveNode : function(command, ui, value) {
				var node = value || selection.getNode();

				// Make sure that the body node isn't removed
				if (node != editor.getBody()) {
					storeSelection();
					editor.dom.remove(node, TRUE);
					restoreSelection();
				}
			},

			mceSelectNodeDepth : function(command, ui, value) {
				var counter = 0;

				dom.getParent(selection.getNode(), function(node) {
					if (node.nodeType == 1 && counter++ == value) {
						selection.select(node);
						return FALSE;
					}
				}, editor.getBody());
			},

			mceSelectNode : function(command, ui, value) {
				selection.select(value);
			},

			mceInsertContent : function(command, ui, value) {
				var parser, serializer, parentNode, rootNode, fragment, args,
					marker, nodeRect, viewPortRect, rng, node, node2, bookmarkHtml, viewportBodyElement;

				//selection.normalize();

				// Setup parser and serializer
				parser = editor.parser;
				serializer = new tinymce.html.Serializer({}, editor.schema);
				bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">\uFEFF</span>';

				// Run beforeSetContent handlers on the HTML to be inserted
				args = {content: value, format: 'html'};
				selection.onBeforeSetContent.dispatch(selection, args);
				value = args.content;

				// Add caret at end of contents if it's missing
				if (value.indexOf('{$caret}') == -1)
					value += '{$caret}';

				// Replace the caret marker with a span bookmark element
				value = value.replace(/\{\$caret\}/, bookmarkHtml);

				// Insert node maker where we will insert the new HTML and get it's parent
				if (!selection.isCollapsed())
					editor.getDoc().execCommand('Delete', false, null);

				parentNode = selection.getNode();

				// Parse the fragment within the context of the parent node
				args = {context : parentNode.nodeName.toLowerCase()};
				fragment = parser.parse(value, args);

				// Move the caret to a more suitable location
				node = fragment.lastChild;
				if (node.attr('id') == 'mce_marker') {
					marker = node;

					for (node = node.prev; node; node = node.walk(true)) {
						if (node.type == 3 || !dom.isBlock(node.name)) {
							node.parent.insert(marker, node, node.name === 'br');
							break;
						}
					}
				}

				// If parser says valid we can insert the contents into that parent
				if (!args.invalid) {
					value = serializer.serialize(fragment);

					// Check if parent is empty or only has one BR element then set the innerHTML of that parent
					node = parentNode.firstChild;
					node2 = parentNode.lastChild;
					if (!node || (node === node2 && node.nodeName === 'BR'))
						dom.setHTML(parentNode, value);
					else
						selection.setContent(value);
				} else {
					// If the fragment was invalid within that context then we need
					// to parse and process the parent it's inserted into

					// Insert bookmark node and get the parent
					selection.setContent(bookmarkHtml);
					parentNode = selection.getNode();
					rootNode = editor.getBody();

					// Opera will return the document node when selection is in root
					if (parentNode.nodeType == 9)
						parentNode = node = rootNode;
					else
						node = parentNode;

					// Find the ancestor just before the root element
					while (node !== rootNode) {
						parentNode = node;
						node = node.parentNode;
					}

					// Get the outer/inner HTML depending on if we are in the root and parser and serialize that
					value = parentNode == rootNode ? rootNode.innerHTML : dom.getOuterHTML(parentNode);
					value = serializer.serialize(
						parser.parse(
							// Need to replace by using a function since $ in the contents would otherwise be a problem
							value.replace(/<span (id="mce_marker"|id=mce_marker).+?<\/span>/i, function() {
								return serializer.serialize(fragment);
							})
						)
					);

					// Set the inner/outer HTML depending on if we are in the root or not
					if (parentNode == rootNode)
						dom.setHTML(rootNode, value);
					else
						dom.setOuterHTML(parentNode, value);
				}

				marker = dom.get('mce_marker');

				// Scroll range into view scrollIntoView on element can't be used since it will scroll the main view port as well
				nodeRect = dom.getRect(marker);
				viewPortRect = dom.getViewPort(editor.getWin());

				// Check if node is out side the viewport if it is then scroll to it
				if ((nodeRect.y + nodeRect.h > viewPortRect.y + viewPortRect.h || nodeRect.y < viewPortRect.y) ||
					(nodeRect.x > viewPortRect.x + viewPortRect.w || nodeRect.x < viewPortRect.x)) {
					viewportBodyElement = tinymce.isIE ? editor.getDoc().documentElement : editor.getBody();
					viewportBodyElement.scrollLeft = nodeRect.x;
					viewportBodyElement.scrollTop = nodeRect.y - viewPortRect.h + 25;
				}

				// Move selection before marker and remove it
				rng = dom.createRng();

				// If previous sibling is a text node set the selection to the end of that node
				node = marker.previousSibling;
				if (node && node.nodeType == 3) {
					rng.setStart(node, node.nodeValue.length);
				} else {
					// If the previous sibling isn't a text node or doesn't exist set the selection before the marker node
					rng.setStartBefore(marker);
					rng.setEndBefore(marker);
				}

				// Remove the marker node and set the new range
				dom.remove(marker);
				selection.setRng(rng);

				// Dispatch after event and add any visual elements needed
				selection.onSetContent.dispatch(selection, args);
				editor.addVisual();
			},

			mceInsertRawHTML : function(command, ui, value) {
				selection.setContent('tiny_mce_marker');
				editor.setContent(editor.getContent().replace(/tiny_mce_marker/g, function() { return value }));
			},

			mceToggleFormat : function(command, ui, value) {
				toggleFormat(value);
			},

			mceSetContent : function(command, ui, value) {
				editor.setContent(value);
			},

			'Indent,Outdent' : function(command) {
				var intentValue, indentUnit, value;

				// Setup indent level
				intentValue = settings.indentation;
				indentUnit = /[a-z%]+$/i.exec(intentValue);
				intentValue = parseInt(intentValue);

				if (!queryCommandState('InsertUnorderedList') && !queryCommandState('InsertOrderedList')) {
					// If forced_root_blocks is set to false we don't have a block to indent so lets create a div
					if (!settings.forced_root_block && !dom.getParent(selection.getNode(), dom.isBlock)) {
						formatter.apply('div');
					}

					each(selection.getSelectedBlocks(), function(element) {
						if (command == 'outdent') {
							value = Math.max(0, parseInt(element.style.paddingLeft || 0) - intentValue);
							dom.setStyle(element, 'paddingLeft', value ? value + indentUnit : '');
						} else
							dom.setStyle(element, 'paddingLeft', (parseInt(element.style.paddingLeft || 0) + intentValue) + indentUnit);
					});
				} else
					execNativeCommand(command);
			},

			mceRepaint : function() {
				var bookmark;

				if (tinymce.isGecko) {
					try {
						storeSelection(TRUE);

						if (selection.getSel())
							selection.getSel().selectAllChildren(editor.getBody());

						selection.collapse(TRUE);
						restoreSelection();
					} catch (ex) {
						// Ignore
					}
				}
			},

			mceToggleFormat : function(command, ui, value) {
				formatter.toggle(value);
			},

			InsertHorizontalRule : function() {
				editor.execCommand('mceInsertContent', false, '<hr />');
			},

			mceToggleVisualAid : function() {
				editor.hasVisual = !editor.hasVisual;
				editor.addVisual();
			},

			mceReplaceContent : function(command, ui, value) {
				editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, selection.getContent({format : 'text'})));
			},

			mceInsertLink : function(command, ui, value) {
				var anchor;

				if (typeof(value) == 'string')
					value = {href : value};

				anchor = dom.getParent(selection.getNode(), 'a');

				// Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
				value.href = value.href.replace(' ', '%20');

				// Remove existing links if there could be child links or that the href isn't specified
				if (!anchor || !value.href) {
					formatter.remove('link');
				}		

				// Apply new link to selection
				if (value.href) {
					formatter.apply('link', value, anchor);
				}
			},

			selectAll : function() {
				var root = dom.getRoot(), rng = dom.createRng();

				// Old IE does a better job with selectall than new versions
				if (selection.getRng().setStart) {
					rng.setStart(root, 0);
					rng.setEnd(root, root.childNodes.length);

					selection.setRng(rng);
				} else {
					execNativeCommand('SelectAll');
				}
			}
		});

		// Add queryCommandState overrides
		addCommands({
			// Override justify commands
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull' : function(command) {
				var name = 'align' + command.substring(7);
				var nodes = selection.isCollapsed() ? [dom.getParent(selection.getNode(), dom.isBlock)] : selection.getSelectedBlocks();
				var matches = tinymce.map(nodes, function(node) {
					return !!formatter.matchNode(node, name);
				});
				return tinymce.inArray(matches, TRUE) !== -1;
			},

			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript' : function(command) {
				return isFormatMatch(command);
			},

			mceBlockQuote : function() {
				return isFormatMatch('blockquote');
			},

			Outdent : function() {
				var node;

				if (settings.inline_styles) {
					if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft) > 0)
						return TRUE;

					if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft) > 0)
						return TRUE;
				}

				return queryCommandState('InsertUnorderedList') || queryCommandState('InsertOrderedList') || (!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'));
			},

			'InsertUnorderedList,InsertOrderedList' : function(command) {
				var list = dom.getParent(selection.getNode(), 'ul,ol');
				return list && 
				     (command === 'insertunorderedlist' && list.tagName === 'UL'
				   || command === 'insertorderedlist' && list.tagName === 'OL');
			}
		}, 'state');

		// Add queryCommandValue overrides
		addCommands({
			'FontSize,FontName' : function(command) {
				var value = 0, parent;

				if (parent = dom.getParent(selection.getNode(), 'span')) {
					if (command == 'fontsize')
						value = parent.style.fontSize;
					else
						value = parent.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();
				}

				return value;
			}
		}, 'value');

		// Add undo manager logic
		addCommands({
			Undo : function() {
				editor.undoManager.undo();
			},

			Redo : function() {
				editor.undoManager.redo();
			}
		});
	};
})(tinymce);

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher;

	tinymce.UndoManager = function(editor) {
		var self, index = 0, data = [], beforeBookmark, onAdd, onUndo, onRedo;

		function getContent() {
			// Remove whitespace before/after and remove pure bogus nodes
			return tinymce.trim(editor.getContent({format : 'raw', no_events : 1}).replace(/<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\/span>/g, ''));
		};

		function addNonTypingUndoLevel() {
			self.typing = false;
			self.add();
		};

		// Create event instances
		onBeforeAdd = new Dispatcher(self);
		onAdd       = new Dispatcher(self);
		onUndo      = new Dispatcher(self);
		onRedo      = new Dispatcher(self);

		// Pass though onAdd event from UndoManager to Editor as onChange
		onAdd.add(function(undoman, level) {
			if (undoman.hasUndo())
				return editor.onChange.dispatch(editor, level, undoman);
		});

		// Pass though onUndo event from UndoManager to Editor
		onUndo.add(function(undoman, level) {
			return editor.onUndo.dispatch(editor, level, undoman);
		});

		// Pass though onRedo event from UndoManager to Editor
		onRedo.add(function(undoman, level) {
			return editor.onRedo.dispatch(editor, level, undoman);
		});

		// Add initial undo level when the editor is initialized
		editor.onInit.add(function() {
			self.add();
		});

		// Get position before an execCommand is processed
		editor.onBeforeExecCommand.add(function(ed, cmd, ui, val, args) {
			if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!args || !args.skip_undo)) {
				self.beforeChange();
			}
		});

		// Add undo level after an execCommand call was made
		editor.onExecCommand.add(function(ed, cmd, ui, val, args) {
			if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!args || !args.skip_undo)) {
				self.add();
			}
		});

		// Add undo level on save contents, drag end and blur/focusout
		editor.onSaveContent.add(addNonTypingUndoLevel);
		editor.dom.bind(editor.dom.getRoot(), 'dragend', addNonTypingUndoLevel);
		editor.dom.bind(editor.getDoc(), tinymce.isGecko ? 'blur' : 'focusout', function(e) {
			if (!editor.removed && self.typing) {
				addNonTypingUndoLevel();
			}
		});

		editor.onKeyUp.add(function(editor, e) {
			var keyCode = e.keyCode;

			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 45 || keyCode == 13 || e.ctrlKey) {
				addNonTypingUndoLevel();
			}
		});

		editor.onKeyDown.add(function(editor, e) {
			var keyCode = e.keyCode;

			// Is caracter positon keys left,right,up,down,home,end,pgdown,pgup,enter
			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 45) {
				if (self.typing) {
					addNonTypingUndoLevel();
				}

				return;
			}

			// If key isn't shift,ctrl,alt,capslock,metakey
			if ((keyCode < 16 || keyCode > 20) && keyCode != 224 && keyCode != 91 && !self.typing) {
				self.beforeChange();
				self.typing = true;
				self.add();
			}
		});

		editor.onMouseDown.add(function(editor, e) {
			if (self.typing) {
				addNonTypingUndoLevel();
			}
		});

		// Add keyboard shortcuts for undo/redo keys
		editor.addShortcut('ctrl+z', 'undo_desc', 'Undo');
		editor.addShortcut('ctrl+y', 'redo_desc', 'Redo');

		self = {
			// Explose for debugging reasons
			data : data,

			typing : false,
			
			onBeforeAdd: onBeforeAdd,

			onAdd : onAdd,

			onUndo : onUndo,

			onRedo : onRedo,

			beforeChange : function() {
				beforeBookmark = editor.selection.getBookmark(2, true);
			},

			add : function(level) {
				var i, settings = editor.settings, lastLevel;

				level = level || {};
				level.content = getContent();
				
				self.onBeforeAdd.dispatch(self, level);

				// Add undo level if needed
				lastLevel = data[index];
				if (lastLevel && lastLevel.content == level.content)
					return null;

				// Set before bookmark on previous level
				if (data[index])
					data[index].beforeBookmark = beforeBookmark;

				// Time to compress
				if (settings.custom_undo_redo_levels) {
					if (data.length > settings.custom_undo_redo_levels) {
						for (i = 0; i < data.length - 1; i++)
							data[i] = data[i + 1];

						data.length--;
						index = data.length;
					}
				}

				// Get a non intrusive normalized bookmark
				level.bookmark = editor.selection.getBookmark(2, true);

				// Crop array if needed
				if (index < data.length - 1)
					data.length = index + 1;

				data.push(level);
				index = data.length - 1;

				self.onAdd.dispatch(self, level);
				editor.isNotDirty = 0;

				return level;
			},

			undo : function() {
				var level, i;

				if (self.typing) {
					self.add();
					self.typing = false;
				}

				if (index > 0) {
					level = data[--index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.beforeBookmark);

					self.onUndo.dispatch(self, level);
				}

				return level;
			},

			redo : function() {
				var level;

				if (index < data.length - 1) {
					level = data[++index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.bookmark);

					self.onRedo.dispatch(self, level);
				}

				return level;
			},

			clear : function() {
				data = [];
				index = 0;
				self.typing = false;
			},

			hasUndo : function() {
				return index > 0 || this.typing;
			},

			hasRedo : function() {
				return index < data.length - 1 && !this.typing;
			}
		};

		return self;
	};
})(tinymce);

tinymce.ForceBlocks = function(editor) {
	var settings = editor.settings, dom = editor.dom, selection = editor.selection, blockElements = editor.schema.getBlockElements();

	function addRootBlocks() {
		var node = selection.getStart(), rootNode = editor.getBody(), rng, startContainer, startOffset, endContainer, endOffset, rootBlockNode, tempNode, offset = -0xFFFFFF, wrapped, isInEditorDocument;

		if (!node || node.nodeType !== 1 || !settings.forced_root_block)
			return;

		// Check if node is wrapped in block
		while (node && node != rootNode) {
			if (blockElements[node.nodeName])
				return;

			node = node.parentNode;
		}

		// Get current selection
		rng = selection.getRng();
		if (rng.setStart) {
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;
		} else {
			// Force control range into text range
			if (rng.item) {
				node = rng.item(0);
				rng = editor.getDoc().body.createTextRange();
				rng.moveToElementText(node);
			}

			isInEditorDocument = rng.parentElement().ownerDocument === editor.getDoc();
			tmpRng = rng.duplicate();
			tmpRng.collapse(true);
			startOffset = tmpRng.move('character', offset) * -1;

			if (!tmpRng.collapsed) {
				tmpRng = rng.duplicate();
				tmpRng.collapse(false);
				endOffset = (tmpRng.move('character', offset) * -1) - startOffset;
			}
		}

		// Wrap non block elements and text nodes
		node = rootNode.firstChild;
		while (node) {
			if (node.nodeType === 3 || (node.nodeType == 1 && !blockElements[node.nodeName])) {
				// Remove empty text nodes
				if (node.nodeType === 3 && node.nodeValue.length == 0) {
					tempNode = node;
					node = node.nextSibling;
					dom.remove(tempNode);
					continue;
				}

				if (!rootBlockNode) {
					rootBlockNode = dom.create(settings.forced_root_block);
					node.parentNode.insertBefore(rootBlockNode, node);
					wrapped = true;
				}

				tempNode = node;
				node = node.nextSibling;
				rootBlockNode.appendChild(tempNode);
			} else {
				rootBlockNode = null;
				node = node.nextSibling;
			}
		}

		if (wrapped) {
			if (rng.setStart) {
				rng.setStart(startContainer, startOffset);
				rng.setEnd(endContainer, endOffset);
				selection.setRng(rng);
			} else {
				// Only select if the previous selection was inside the document to prevent auto focus in quirks mode
				if (isInEditorDocument) {
					try {
						rng = editor.getDoc().body.createTextRange();
						rng.moveToElementText(rootNode);
						rng.collapse(true);
						rng.moveStart('character', startOffset);

						if (endOffset > 0)
							rng.moveEnd('character', endOffset);

						rng.select();
					} catch (ex) {
						// Ignore
					}
				}
			}

			editor.nodeChanged();
		}
	};

	// Force root blocks
	if (settings.forced_root_block) {
		editor.onKeyUp.add(addRootBlocks);
		editor.onNodeChange.add(addRootBlocks);
	}
};

(function(tinymce) {
	// Shorten names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, extend = tinymce.extend;

	tinymce.create('tinymce.ControlManager', {
		ControlManager : function(ed, s) {
			var t = this, i;

			s = s || {};
			t.editor = ed;
			t.controls = {};
			t.onAdd = new tinymce.util.Dispatcher(t);
			t.onPostRender = new tinymce.util.Dispatcher(t);
			t.prefix = s.prefix || ed.id + '_';
			t._cls = {};

			t.onPostRender.add(function() {
				each(t.controls, function(c) {
					c.postRender();
				});
			});
		},

		get : function(id) {
			return this.controls[this.prefix + id] || this.controls[id];
		},

		setActive : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setActive(s);

			return c;
		},

		setDisabled : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setDisabled(s);

			return c;
		},

		add : function(c) {
			var t = this;

			if (c) {
				t.controls[c.id] = c;
				t.onAdd.dispatch(c, t);
			}

			return c;
		},

		createControl : function(name) {
			var ctrl, i, l, self = this, editor = self.editor, factories, ctrlName;

			// Build control factory cache
			if (!self.controlFactories) {
				self.controlFactories = [];
				each(editor.plugins, function(plugin) {
					if (plugin.createControl) {
						self.controlFactories.push(plugin);
					}
				});
			}

			// Create controls by asking cached factories
			factories = self.controlFactories;
			for (i = 0, l = factories.length; i < l; i++) {
				ctrl = factories[i].createControl(name, self);

				if (ctrl) {
					return self.add(ctrl);
				}
			}

			// Create sepearator
			if (name === "|" || name === "separator") {
				return self.createSeparator();
			}

			// Create control from button collection
			if (editor.buttons && (ctrl = editor.buttons[name])) {
				return self.createButton(name, ctrl);
			}

			return self.add(ctrl);
		},

		createDropMenu : function(id, s, cc) {
			var t = this, ed = t.editor, c, bm, v, cls;

			s = extend({
				'class' : 'mceDropDown',
				constrain : ed.settings.constrain_menus
			}, s);

			s['class'] = s['class'] + ' ' + ed.getParam('skin') + 'Skin';
			if (v = ed.getParam('skin_variant'))
				s['class'] += ' ' + ed.getParam('skin') + 'Skin' + v.substring(0, 1).toUpperCase() + v.substring(1);

			s['class'] += ed.settings.directionality == "rtl" ? ' mceRtl' : '';

			id = t.prefix + id;
			cls = cc || t._cls.dropmenu || tinymce.ui.DropMenu;
			c = t.controls[id] = new cls(id, s);
			c.onAddItem.add(function(c, o) {
				var s = o.settings;

				s.title = ed.getLang(s.title, s.title);

				if (!s.onclick) {
					s.onclick = function(v) {
						if (s.cmd)
							ed.execCommand(s.cmd, s.ui || false, s.value);
					};
				}
			});

			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();

					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		createListBox : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;


			function useNativeListForAccessibility(ed) {
				return ed.settings.use_accessible_selects && !tinymce.isGecko
			}

			if (ed.settings.use_native_selects || useNativeListForAccessibility(ed))
				c = new tinymce.ui.NativeListBox(id, s);
			else {
				cls = cc || t._cls.listbox || tinymce.ui.ListBox;
				c = new cls(id, s, ed);
			}

			t.controls[id] = c;

			// Fix focus problem in Safari
			if (tinymce.isWebKit) {
				c.onPostRender.add(function(c, n) {
					// Store bookmark on mousedown
					Event.add(n, 'mousedown', function() {
						ed.bookmark = ed.selection.getBookmark(1);
					});

					// Restore on focus, since it might be lost
					Event.add(n, 'focus', function() {
						ed.selection.moveToBookmark(ed.bookmark);
						ed.bookmark = null;
					});
				});
			}

			if (c.hideMenu)
				ed.onMouseDown.add(c.hideMenu, c);

			return t.add(c);
		},

		createButton : function(id, s, cc) {
			var t = this, ed = t.editor, o, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.label = ed.translate(s.label);
			s.scope = s.scope || ed;

			if (!s.onclick && !s.menu_button) {
				s.onclick = function() {
					ed.execCommand(s.cmd, s.ui || false, s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				unavailable_prefix : ed.getLang('unavailable', ''),
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (s.menu_button) {
				cls = cc || t._cls.menubutton || tinymce.ui.MenuButton;
				c = new cls(id, s, ed);
				ed.onMouseDown.add(c.hideMenu, c);
			} else {
				cls = t._cls.button || tinymce.ui.Button;
				c = new cls(id, s, ed);
			}

			return t.add(c);
		},

		createMenuButton : function(id, s, cc) {
			s = s || {};
			s.menu_button = 1;

			return this.createButton(id, s, cc);
		},

		createSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.splitbutton || tinymce.ui.SplitButton;
			c = t.add(new cls(id, s, ed));
			ed.onMouseDown.add(c.hideMenu, c);

			return c;
		},

		createColorSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls, bm;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					if (tinymce.isIE)
						bm = ed.selection.getBookmark(1);

					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				'menu_class' : ed.getParam('skin') + 'Skin',
				scope : s.scope,
				more_colors_title : ed.getLang('more_colors')
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.colorsplitbutton || tinymce.ui.ColorSplitButton;
			c = new cls(id, s, ed);
			ed.onMouseDown.add(c.hideMenu, c);

			// Remove the menu element when the editor is removed
			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();
					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		createToolbar : function(id, s, cc) {
			var c, t = this, cls;

			id = t.prefix + id;
			cls = cc || t._cls.toolbar || tinymce.ui.Toolbar;
			c = new cls(id, s, t.editor);

			if (t.get(id))
				return null;

			return t.add(c);
		},
		
		createToolbarGroup : function(id, s, cc) {
			var c, t = this, cls;
			id = t.prefix + id;
			cls = cc || this._cls.toolbarGroup || tinymce.ui.ToolbarGroup;
			c = new cls(id, s, t.editor);
			
			if (t.get(id))
				return null;
			
			return t.add(c);
		},

		createSeparator : function(cc) {
			var cls = cc || this._cls.separator || tinymce.ui.Separator;

			return new cls();
		},

		setControlType : function(n, c) {
			return this._cls[n.toLowerCase()] = c;
		},
	
		destroy : function() {
			each(this.controls, function(c) {
				c.destroy();
			});

			this.controls = null;
		}
	});
})(tinymce);

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isIE = tinymce.isIE, isOpera = tinymce.isOpera;

	tinymce.create('tinymce.WindowManager', {
		WindowManager : function(ed) {
			var t = this;

			t.editor = ed;
			t.onOpen = new Dispatcher(t);
			t.onClose = new Dispatcher(t);
			t.params = {};
			t.features = {};
		},

		open : function(s, p) {
			var t = this, f = '', x, y, mo = t.editor.settings.dialog_type == 'modal', w, sw, sh, vp = tinymce.DOM.getViewPort(), u;

			// Default some options
			s = s || {};
			p = p || {};
			sw = isOpera ? vp.w : screen.width; // Opera uses windows inside the Opera window
			sh = isOpera ? vp.h : screen.height;
			s.name = s.name || 'mc_' + new Date().getTime();
			s.width = parseInt(s.width || 320);
			s.height = parseInt(s.height || 240);
			s.resizable = true;
			s.left = s.left || parseInt(sw / 2.0) - (s.width / 2.0);
			s.top = s.top || parseInt(sh / 2.0) - (s.height / 2.0);
			p.inline = false;
			p.mce_width = s.width;
			p.mce_height = s.height;
			p.mce_auto_focus = s.auto_focus;

			if (mo) {
				if (isIE) {
					s.center = true;
					s.help = false;
					s.dialogWidth = s.width + 'px';
					s.dialogHeight = s.height + 'px';
					s.scroll = s.scrollbars || false;
				}
			}

			// Build features string
			each(s, function(v, k) {
				if (tinymce.is(v, 'boolean'))
					v = v ? 'yes' : 'no';

				if (!/^(name|url)$/.test(k)) {
					if (isIE && mo)
						f += (f ? ';' : '') + k + ':' + v;
					else
						f += (f ? ',' : '') + k + '=' + v;
				}
			});

			t.features = s;
			t.params = p;
			t.onOpen.dispatch(t, s, p);

			u = s.url || s.file;
			u = tinymce._addVer(u);

			try {
				if (isIE && mo) {
					w = 1;
					window.showModalDialog(u, window, f);
				} else
					w = window.open(u, s.name, f);
			} catch (ex) {
				// Ignore
			}

			if (!w)
				alert(t.editor.getLang('popup_blocked'));
		},

		close : function(w) {
			w.close();
			this.onClose.dispatch(this);
		},

		createInstance : function(cl, a, b, c, d, e) {
			var f = tinymce.resolve(cl);

			return new f(a, b, c, d, e);
		},

		confirm : function(t, cb, s, w) {
			w = w || window;

			cb.call(s || this, w.confirm(this._decode(this.editor.getLang(t, t))));
		},

		alert : function(tx, cb, s, w) {
			var t = this;

			w = w || window;
			w.alert(t._decode(t.editor.getLang(tx, tx)));

			if (cb)
				cb.call(s || t);
		},

		resizeBy : function(dw, dh, win) {
			win.resizeBy(dw, dh);
		},

		// Internal functions

		_decode : function(s) {
			return tinymce.DOM.decode(s).replace(/\\n/g, '\n');
		}
	});
}(tinymce));
(function(tinymce) {
	tinymce.Formatter = function(ed) {
		var formats = {},
			each = tinymce.each,
			dom = ed.dom,
			selection = ed.selection,
			TreeWalker = tinymce.dom.TreeWalker,
			rangeUtils = new tinymce.dom.RangeUtils(dom),
			isValid = ed.schema.isValidChild,
			isArray = tinymce.isArray,
			isBlock = dom.isBlock,
			forcedRootBlock = ed.settings.forced_root_block,
			nodeIndex = dom.nodeIndex,
			INVISIBLE_CHAR = '\uFEFF',
			MCE_ATTR_RE = /^(src|href|style)$/,
			FALSE = false,
			TRUE = true,
			formatChangeData,
			undef,
			getContentEditable = dom.getContentEditable;

		function isTextBlock(name) {
			return !!ed.schema.getTextBlocks()[name.toLowerCase()];
		}

		function getParents(node, selector) {
			return dom.getParents(node, selector, dom.getRoot());
		};

		function isCaretNode(node) {
			return node.nodeType === 1 && node.id === '_mce_caret';
		};

		function defaultFormats() {
			register({
				alignleft : [
					{selector : 'figure,p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'left'}, defaultBlock: 'div'},
					{selector : 'img,table', collapsed : false, styles : {'float' : 'left'}}
				],

				aligncenter : [
					{selector : 'figure,p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'center'}, defaultBlock: 'div'},
					{selector : 'img', collapsed : false, styles : {display : 'block', marginLeft : 'auto', marginRight : 'auto'}},
					{selector : 'table', collapsed : false, styles : {marginLeft : 'auto', marginRight : 'auto'}}
				],

				alignright : [
					{selector : 'figure,p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'right'}, defaultBlock: 'div'},
					{selector : 'img,table', collapsed : false, styles : {'float' : 'right'}}
				],

				alignfull : [
					{selector : 'figure,p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'justify'}, defaultBlock: 'div'}
				],

				bold : [
					{inline : 'strong', remove : 'all'},
					{inline : 'span', styles : {fontWeight : 'bold'}},
					{inline : 'b', remove : 'all'}
				],

				italic : [
					{inline : 'em', remove : 'all'},
					{inline : 'span', styles : {fontStyle : 'italic'}},
					{inline : 'i', remove : 'all'}
				],

				underline : [
					{inline : 'span', styles : {textDecoration : 'underline'}, exact : true},
					{inline : 'u', remove : 'all'}
				],

				strikethrough : [
					{inline : 'span', styles : {textDecoration : 'line-through'}, exact : true},
					{inline : 'strike', remove : 'all'}
				],

				forecolor : {inline : 'span', styles : {color : '%value'}, wrap_links : false},
				hilitecolor : {inline : 'span', styles : {backgroundColor : '%value'}, wrap_links : false},
				fontname : {inline : 'span', styles : {fontFamily : '%value'}},
				fontsize : {inline : 'span', styles : {fontSize : '%value'}},
				fontsize_class : {inline : 'span', attributes : {'class' : '%value'}},
				blockquote : {block : 'blockquote', wrapper : 1, remove : 'all'},
				subscript : {inline : 'sub'},
				superscript : {inline : 'sup'},

				link : {inline : 'a', selector : 'a', remove : 'all', split : true, deep : true,
					onmatch : function(node) {
						return true;
					},

					onformat : function(elm, fmt, vars) {
						each(vars, function(value, key) {
							dom.setAttrib(elm, key, value);
						});
					}
				},

				removeformat : [
					{selector : 'b,strong,em,i,font,u,strike', remove : 'all', split : true, expand : false, block_expand : true, deep : true},
					{selector : 'span', attributes : ['style', 'class'], remove : 'empty', split : true, expand : false, deep : true},
					{selector : '*', attributes : ['style', 'class'], split : false, expand : false, deep : true}
				]
			});

			// Register default block formats
			each('p h1 h2 h3 h4 h5 h6 div address pre div code dt dd samp'.split(/\s/), function(name) {
				register(name, {block : name, remove : 'all'});
			});

			// Register user defined formats
			register(ed.settings.formats);
		};

		function addKeyboardShortcuts() {
			// Add some inline shortcuts
			ed.addShortcut('ctrl+b', 'bold_desc', 'Bold');
			ed.addShortcut('ctrl+i', 'italic_desc', 'Italic');
			ed.addShortcut('ctrl+u', 'underline_desc', 'Underline');

			// BlockFormat shortcuts keys
			for (var i = 1; i <= 6; i++) {
				ed.addShortcut('ctrl+' + i, '', ['FormatBlock', false, 'h' + i]);
			}

			ed.addShortcut('ctrl+7', '', ['FormatBlock', false, 'p']);
			ed.addShortcut('ctrl+8', '', ['FormatBlock', false, 'div']);
			ed.addShortcut('ctrl+9', '', ['FormatBlock', false, 'address']);
		};

		// Public functions

		function get(name) {
			return name ? formats[name] : formats;
		};

		function register(name, format) {
			if (name) {
				if (typeof(name) !== 'string') {
					each(name, function(format, name) {
						register(name, format);
					});
				} else {
					// Force format into array and add it to internal collection
					format = format.length ? format : [format];

					each(format, function(format) {
						// Set deep to false by default on selector formats this to avoid removing
						// alignment on images inside paragraphs when alignment is changed on paragraphs
						if (format.deep === undef)
							format.deep = !format.selector;

						// Default to true
						if (format.split === undef)
							format.split = !format.selector || format.inline;

						// Default to true
						if (format.remove === undef && format.selector && !format.inline)
							format.remove = 'none';

						// Mark format as a mixed format inline + block level
						if (format.selector && format.inline) {
							format.mixed = true;
							format.block_expand = true;
						}

						// Split classes if needed
						if (typeof(format.classes) === 'string')
							format.classes = format.classes.split(/\s+/);
					});

					formats[name] = format;
				}
			}
		};

		var getTextDecoration = function(node) {
			var decoration;

			ed.dom.getParent(node, function(n) {
				decoration = ed.dom.getStyle(n, 'text-decoration');
				return decoration && decoration !== 'none';
			});

			return decoration;
		};

		var processUnderlineAndColor = function(node) {
			var textDecoration;
			if (node.nodeType === 1 && node.parentNode && node.parentNode.nodeType === 1) {
				textDecoration = getTextDecoration(node.parentNode);
				if (ed.dom.getStyle(node, 'color') && textDecoration) {
					ed.dom.setStyle(node, 'text-decoration', textDecoration);
				} else if (ed.dom.getStyle(node, 'textdecoration') === textDecoration) {
					ed.dom.setStyle(node, 'text-decoration', null);
				}
			}
		};

		function apply(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, rng, i, isCollapsed = selection.isCollapsed();

			function setElementFormat(elm, fmt) {
				fmt = fmt || format;

				if (elm) {
					if (fmt.onformat) {
						fmt.onformat(elm, fmt, vars, node);
					}

					each(fmt.styles, function(value, name) {
						dom.setStyle(elm, name, replaceVars(value, vars));
					});

					each(fmt.attributes, function(value, name) {
						dom.setAttrib(elm, name, replaceVars(value, vars));
					});

					each(fmt.classes, function(value) {
						value = replaceVars(value, vars);

						if (!dom.hasClass(elm, value))
							dom.addClass(elm, value);
					});
				}
			};
			function adjustSelectionToVisibleSelection() {
				function findSelectionEnd(start, end) {
					var walker = new TreeWalker(end);
					for (node = walker.current(); node; node = walker.prev()) {
						if (node.childNodes.length > 1 || node == start || node.tagName == 'BR') {
							return node;
						}
					}
				};

				// Adjust selection so that a end container with a end offset of zero is not included in the selection
				// as this isn't visible to the user.
				var rng = ed.selection.getRng();
				var start = rng.startContainer;
				var end = rng.endContainer;

				if (start != end && rng.endOffset === 0) {
					var newEnd = findSelectionEnd(start, end);
					var endOffset = newEnd.nodeType == 3 ? newEnd.length : newEnd.childNodes.length;

					rng.setEnd(newEnd, endOffset);
				}

				return rng;
			}
			
			function applyStyleToList(node, bookmark, wrapElm, newWrappers, process){
				var nodes = [], listIndex = -1, list, startIndex = -1, endIndex = -1, currentWrapElm;
				
				// find the index of the first child list.
				each(node.childNodes, function(n, index) {
					if (n.nodeName === "UL" || n.nodeName === "OL") {
						listIndex = index;
						list = n;
						return false;
					}
				});
				
				// get the index of the bookmarks
				each(node.childNodes, function(n, index) {
					if (n.nodeName === "SPAN" && dom.getAttrib(n, "data-mce-type") == "bookmark") {
						if (n.id == bookmark.id + "_start") {
							startIndex = index;
						} else if (n.id == bookmark.id + "_end") {
							endIndex = index;
						}
					}
				});
				
				// if the selection spans across an embedded list, or there isn't an embedded list - handle processing normally
				if (listIndex <= 0 || (startIndex < listIndex && endIndex > listIndex)) {
					each(tinymce.grep(node.childNodes), process);
					return 0;
				} else {
					currentWrapElm = dom.clone(wrapElm, FALSE);

					// create a list of the nodes on the same side of the list as the selection
					each(tinymce.grep(node.childNodes), function(n, index) {
						if ((startIndex < listIndex && index < listIndex) || (startIndex > listIndex && index > listIndex)) {
							nodes.push(n); 
							n.parentNode.removeChild(n);
						}
					});

					// insert the wrapping element either before or after the list.
					if (startIndex < listIndex) {
						node.insertBefore(currentWrapElm, list);
					} else if (startIndex > listIndex) {
						node.insertBefore(currentWrapElm, list.nextSibling);
					}
					
					// add the new nodes to the list.
					newWrappers.push(currentWrapElm);

					each(nodes, function(node) {
						currentWrapElm.appendChild(node);
					});

					return currentWrapElm;
				}
			};

			function applyRngStyle(rng, bookmark, node_specific) {
				var newWrappers = [], wrapName, wrapElm, contentEditable = true;

				// Setup wrapper element
				wrapName = format.inline || format.block;
				wrapElm = dom.create(wrapName);
				setElementFormat(wrapElm);

				rangeUtils.walk(rng, function(nodes) {
					var currentWrapElm;

					function process(node) {
						var nodeName, parentName, found, hasContentEditableState, lastContentEditable;

						lastContentEditable = contentEditable;
						nodeName = node.nodeName.toLowerCase();
						parentName = node.parentNode.nodeName.toLowerCase();

						// Node has a contentEditable value
						if (node.nodeType === 1 && getContentEditable(node)) {
							lastContentEditable = contentEditable;
							contentEditable = getContentEditable(node) === "true";
							hasContentEditableState = true; // We don't want to wrap the container only it's children
						}

						// Stop wrapping on br elements
						if (isEq(nodeName, 'br')) {
							currentWrapElm = 0;

							// Remove any br elements when we wrap things
							if (format.block)
								dom.remove(node);

							return;
						}

						// If node is wrapper type
						if (format.wrapper && matchNode(node, name, vars)) {
							currentWrapElm = 0;
							return;
						}

						// Can we rename the block
						if (contentEditable && !hasContentEditableState && format.block && !format.wrapper && isTextBlock(nodeName)) {
							node = dom.rename(node, wrapName);
							setElementFormat(node);
							newWrappers.push(node);
							currentWrapElm = 0;
							return;
						}

						// Handle selector patterns
						if (format.selector) {
							// Look for matching formats
							each(formatList, function(format) {
								// Check collapsed state if it exists
								if ('collapsed' in format && format.collapsed !== isCollapsed) {
									return;
								}

								if (dom.is(node, format.selector) && !isCaretNode(node)) {
									setElementFormat(node, format);
									found = true;
								}
							});

							// Continue processing if a selector match wasn't found and a inline element is defined
							if (!format.inline || found) {
								currentWrapElm = 0;
								return;
							}
						}

						// Is it valid to wrap this item
						if (contentEditable && !hasContentEditableState && isValid(wrapName, nodeName) && isValid(parentName, wrapName) &&
								!(!node_specific && node.nodeType === 3 && node.nodeValue.length === 1 && node.nodeValue.charCodeAt(0) === 65279) && !isCaretNode(node)) {
							// Start wrapping
							if (!currentWrapElm) {
								// Wrap the node
								currentWrapElm = dom.clone(wrapElm, FALSE);
								node.parentNode.insertBefore(currentWrapElm, node);
								newWrappers.push(currentWrapElm);
							}

							currentWrapElm.appendChild(node);
						} else if (nodeName == 'li' && bookmark) {
							// Start wrapping - if we are in a list node and have a bookmark, then we will always begin by wrapping in a new element.
							currentWrapElm = applyStyleToList(node, bookmark, wrapElm, newWrappers, process);
						} else {
							// Start a new wrapper for possible children
							currentWrapElm = 0;
							
							each(tinymce.grep(node.childNodes), process);

							if (hasContentEditableState) {
								contentEditable = lastContentEditable; // Restore last contentEditable state from stack
							}

							// End the last wrapper
							currentWrapElm = 0;
						}
					};

					// Process siblings from range
					each(nodes, process);
				});

				// Wrap links inside as well, for example color inside a link when the wrapper is around the link
				if (format.wrap_links === false) {
					each(newWrappers, function(node) {
						function process(node) {
							var i, currentWrapElm, children;

							if (node.nodeName === 'A') {
								currentWrapElm = dom.clone(wrapElm, FALSE);
								newWrappers.push(currentWrapElm);

								children = tinymce.grep(node.childNodes);
								for (i = 0; i < children.length; i++)
									currentWrapElm.appendChild(children[i]);

								node.appendChild(currentWrapElm);
							}

							each(tinymce.grep(node.childNodes), process);
						};

						process(node);
					});
				}

				// Cleanup
				
				each(newWrappers, function(node) {
					var childCount;

					function getChildCount(node) {
						var count = 0;

						each(node.childNodes, function(node) {
							if (!isWhiteSpaceNode(node) && !isBookmarkNode(node))
								count++;
						});

						return count;
					};

					function mergeStyles(node) {
						var child, clone;

						each(node.childNodes, function(node) {
							if (node.nodeType == 1 && !isBookmarkNode(node) && !isCaretNode(node)) {
								child = node;
								return FALSE; // break loop
							}
						});

						// If child was found and of the same type as the current node
						if (child && matchName(child, format)) {
							clone = dom.clone(child, FALSE);
							setElementFormat(clone);

							dom.replace(clone, node, TRUE);
							dom.remove(child, 1);
						}

						return clone || node;
					};

					childCount = getChildCount(node);

					// Remove empty nodes but only if there is multiple wrappers and they are not block
					// elements so never remove single <h1></h1> since that would remove the currrent empty block element where the caret is at
					if ((newWrappers.length > 1 || !isBlock(node)) && childCount === 0) {
						dom.remove(node, 1);
						return;
					}

					if (format.inline || format.wrapper) {
						// Merges the current node with it's children of similar type to reduce the number of elements
						if (!format.exact && childCount === 1)
							node = mergeStyles(node);

						// Remove/merge children
						each(formatList, function(format) {
							// Merge all children of similar type will move styles from child to parent
							// this: <span style="color:red"><b><span style="color:red; font-size:10px">text</span></b></span>
							// will become: <span style="color:red"><b><span style="font-size:10px">text</span></b></span>
							each(dom.select(format.inline, node), function(child) {
								var parent;

								// When wrap_links is set to false we don't want
								// to remove the format on children within links
								if (format.wrap_links === false) {
									parent = child.parentNode;

									do {
										if (parent.nodeName === 'A')
											return;
									} while (parent = parent.parentNode);
								}

								removeFormat(format, vars, child, format.exact ? child : null);
							});
						});

						// Remove child if direct parent is of same type
						if (matchNode(node.parentNode, name, vars)) {
							dom.remove(node, 1);
							node = 0;
							return TRUE;
						}

						// Look for parent with similar style format
						if (format.merge_with_parents) {
							dom.getParent(node.parentNode, function(parent) {
								if (matchNode(parent, name, vars)) {
									dom.remove(node, 1);
									node = 0;
									return TRUE;
								}
							});
						}

						// Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
						if (node && format.merge_siblings !== false) {
							node = mergeSiblings(getNonWhiteSpaceSibling(node), node);
							node = mergeSiblings(node, getNonWhiteSpaceSibling(node, TRUE));
						}
					}
				});
			};

			if (format) {
				if (node) {
					if (node.nodeType) {
						rng = dom.createRng();
						rng.setStartBefore(node);
						rng.setEndAfter(node);
						applyRngStyle(expandRng(rng, formatList), null, true);
					} else {
						applyRngStyle(node, null, true);
					}
				} else {
					if (!isCollapsed || !format.inline || dom.select('td.mceSelected,th.mceSelected').length) {
						// Obtain selection node before selection is unselected by applyRngStyle()
						var curSelNode = ed.selection.getNode();

						// If the formats have a default block and we can't find a parent block then start wrapping it with a DIV this is for forced_root_blocks: false
						// It's kind of a hack but people should be using the default block type P since all desktop editors work that way
						if (!forcedRootBlock && formatList[0].defaultBlock && !dom.getParent(curSelNode, dom.isBlock)) {
							apply(formatList[0].defaultBlock);
						}

						// Apply formatting to selection
						ed.selection.setRng(adjustSelectionToVisibleSelection());
						bookmark = selection.getBookmark();
						applyRngStyle(expandRng(selection.getRng(TRUE), formatList), bookmark);

						// Colored nodes should be underlined so that the color of the underline matches the text color.
						if (format.styles && (format.styles.color || format.styles.textDecoration)) {
							tinymce.walk(curSelNode, processUnderlineAndColor, 'childNodes');
							processUnderlineAndColor(curSelNode);
						}

						selection.moveToBookmark(bookmark);
						moveStart(selection.getRng(TRUE));
						ed.nodeChanged();
					} else
						performCaretAction('apply', name, vars);
				}
			}
		};

		function remove(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, i, rng, contentEditable = true;

			// Merges the styles for each node
			function process(node) {
				var children, i, l, localContentEditable, lastContentEditable, hasContentEditableState;

				// Node has a contentEditable value
				if (node.nodeType === 1 && getContentEditable(node)) {
					lastContentEditable = contentEditable;
					contentEditable = getContentEditable(node) === "true";
					hasContentEditableState = true; // We don't want to wrap the container only it's children
				}

				// Grab the children first since the nodelist might be changed
				children = tinymce.grep(node.childNodes);

				// Process current node
				if (contentEditable && !hasContentEditableState) {
					for (i = 0, l = formatList.length; i < l; i++) {
						if (removeFormat(formatList[i], vars, node, node))
							break;
					}
				}

				// Process the children
				if (format.deep) {
					if (children.length) {					
						for (i = 0, l = children.length; i < l; i++)
							process(children[i]);

						if (hasContentEditableState) {
							contentEditable = lastContentEditable; // Restore last contentEditable state from stack
						}
					}
				}
			};

			function findFormatRoot(container) {
				var formatRoot;

				// Find format root
				each(getParents(container.parentNode).reverse(), function(parent) {
					var format;

					// Find format root element
					if (!formatRoot && parent.id != '_start' && parent.id != '_end') {
						// Is the node matching the format we are looking for
						format = matchNode(parent, name, vars);
						if (format && format.split !== false)
							formatRoot = parent;
					}
				});

				return formatRoot;
			};

			function wrapAndSplit(format_root, container, target, split) {
				var parent, clone, lastClone, firstClone, i, formatRootParent;

				// Format root found then clone formats and split it
				if (format_root) {
					formatRootParent = format_root.parentNode;

					for (parent = container.parentNode; parent && parent != formatRootParent; parent = parent.parentNode) {
						clone = dom.clone(parent, FALSE);

						for (i = 0; i < formatList.length; i++) {
							if (removeFormat(formatList[i], vars, clone, clone)) {
								clone = 0;
								break;
							}
						}

						// Build wrapper node
						if (clone) {
							if (lastClone)
								clone.appendChild(lastClone);

							if (!firstClone)
								firstClone = clone;

							lastClone = clone;
						}
					}

					// Never split block elements if the format is mixed
					if (split && (!format.mixed || !isBlock(format_root)))
						container = dom.split(format_root, container);

					// Wrap container in cloned formats
					if (lastClone) {
						target.parentNode.insertBefore(lastClone, target);
						firstClone.appendChild(target);
					}
				}

				return container;
			};

			function splitToFormatRoot(container) {
				return wrapAndSplit(findFormatRoot(container), container, container, true);
			};

			function unwrap(start) {
				var node = dom.get(start ? '_start' : '_end'),
					out = node[start ? 'firstChild' : 'lastChild'];

				// If the end is placed within the start the result will be removed
				// So this checks if the out node is a bookmark node if it is it
				// checks for another more suitable node
				if (isBookmarkNode(out))
					out = out[start ? 'firstChild' : 'lastChild'];

				dom.remove(node, true);

				return out;
			};

			function removeRngStyle(rng) {
				var startContainer, endContainer, node;

				rng = expandRng(rng, formatList, TRUE);

				if (format.split) {
					startContainer = getContainer(rng, TRUE);
					endContainer = getContainer(rng);

					if (startContainer != endContainer) {
						// WebKit will render the table incorrectly if we wrap a TD in a SPAN so lets see if the can use the first child instead
						// This will happen if you tripple click a table cell and use remove formatting
						if (/^(TR|TD)$/.test(startContainer.nodeName) && startContainer.firstChild) {
							startContainer = (startContainer.nodeName == "TD" ? startContainer.firstChild : startContainer.firstChild.firstChild) || startContainer;
						}

						// Wrap start/end nodes in span element since these might be cloned/moved
						startContainer = wrap(startContainer, 'span', {id : '_start', 'data-mce-type' : 'bookmark'});
						endContainer = wrap(endContainer, 'span', {id : '_end', 'data-mce-type' : 'bookmark'});

						// Split start/end
						splitToFormatRoot(startContainer);
						splitToFormatRoot(endContainer);

						// Unwrap start/end to get real elements again
						startContainer = unwrap(TRUE);
						endContainer = unwrap();
					} else
						startContainer = endContainer = splitToFormatRoot(startContainer);

					// Update range positions since they might have changed after the split operations
					rng.startContainer = startContainer.parentNode;
					rng.startOffset = nodeIndex(startContainer);
					rng.endContainer = endContainer.parentNode;
					rng.endOffset = nodeIndex(endContainer) + 1;
				}

				// Remove items between start/end
				rangeUtils.walk(rng, function(nodes) {
					each(nodes, function(node) {
						process(node);

						// Remove parent span if it only contains text-decoration: underline, yet a parent node is also underlined.
						if (node.nodeType === 1 && ed.dom.getStyle(node, 'text-decoration') === 'underline' && node.parentNode && getTextDecoration(node.parentNode) === 'underline') {
							removeFormat({'deep': false, 'exact': true, 'inline': 'span', 'styles': {'textDecoration' : 'underline'}}, null, node);
						}
					});
				});
			};

			// Handle node
			if (node) {
				if (node.nodeType) {
					rng = dom.createRng();
					rng.setStartBefore(node);
					rng.setEndAfter(node);
					removeRngStyle(rng);
				} else {
					removeRngStyle(node);
				}

				return;
			}

			if (!selection.isCollapsed() || !format.inline || dom.select('td.mceSelected,th.mceSelected').length) {
				bookmark = selection.getBookmark();
				removeRngStyle(selection.getRng(TRUE));
				selection.moveToBookmark(bookmark);

				// Check if start element still has formatting then we are at: "<b>text|</b>text" and need to move the start into the next text node
				if (format.inline && match(name, vars, selection.getStart())) {
					moveStart(selection.getRng(true));
				}

				ed.nodeChanged();
			} else
				performCaretAction('remove', name, vars);
		};

		function toggle(name, vars, node) {
			var fmt = get(name);

			if (match(name, vars, node) && (!('toggle' in fmt[0]) || fmt[0].toggle))
				remove(name, vars, node);
			else
				apply(name, vars, node);
		};

		function matchNode(node, name, vars, similar) {
			var formatList = get(name), format, i, classes;

			function matchItems(node, format, item_name) {
				var key, value, items = format[item_name], i;

				// Custom match
				if (format.onmatch) {
					return format.onmatch(node, format, item_name);
				}

				// Check all items
				if (items) {
					// Non indexed object
					if (items.length === undef) {
						for (key in items) {
							if (items.hasOwnProperty(key)) {
								if (item_name === 'attributes')
									value = dom.getAttrib(node, key);
								else
									value = getStyle(node, key);

								if (similar && !value && !format.exact)
									return;

								if ((!similar || format.exact) && !isEq(value, replaceVars(items[key], vars)))
									return;
							}
						}
					} else {
						// Only one match needed for indexed arrays
						for (i = 0; i < items.length; i++) {
							if (item_name === 'attributes' ? dom.getAttrib(node, items[i]) : getStyle(node, items[i]))
								return format;
						}
					}
				}

				return format;
			};

			if (formatList && node) {
				// Check each format in list
				for (i = 0; i < formatList.length; i++) {
					format = formatList[i];

					// Name name, attributes, styles and classes
					if (matchName(node, format) && matchItems(node, format, 'attributes') && matchItems(node, format, 'styles')) {
						// Match classes
						if (classes = format.classes) {
							for (i = 0; i < classes.length; i++) {
								if (!dom.hasClass(node, classes[i]))
									return;
							}
						}

						return format;
					}
				}
			}
		};

		function match(name, vars, node) {
			var startNode;

			function matchParents(node) {
				// Find first node with similar format settings
				node = dom.getParent(node, function(node) {
					return !!matchNode(node, name, vars, true);
				});

				// Do an exact check on the similar format element
				return matchNode(node, name, vars);
			};

			// Check specified node
			if (node)
				return matchParents(node);

			// Check selected node
			node = selection.getNode();
			if (matchParents(node))
				return TRUE;

			// Check start node if it's different
			startNode = selection.getStart();
			if (startNode != node) {
				if (matchParents(startNode))
					return TRUE;
			}

			return FALSE;
		};

		function matchAll(names, vars) {
			var startElement, matchedFormatNames = [], checkedMap = {}, i, ni, name;

			// Check start of selection for formats
			startElement = selection.getStart();
			dom.getParent(startElement, function(node) {
				var i, name;

				for (i = 0; i < names.length; i++) {
					name = names[i];

					if (!checkedMap[name] && matchNode(node, name, vars)) {
						checkedMap[name] = true;
						matchedFormatNames.push(name);
					}
				}
			}, dom.getRoot());

			return matchedFormatNames;
		};

		function canApply(name) {
			var formatList = get(name), startNode, parents, i, x, selector;

			if (formatList) {
				startNode = selection.getStart();
				parents = getParents(startNode);

				for (x = formatList.length - 1; x >= 0; x--) {
					selector = formatList[x].selector;

					// Format is not selector based, then always return TRUE
					if (!selector)
						return TRUE;

					for (i = parents.length - 1; i >= 0; i--) {
						if (dom.is(parents[i], selector))
							return TRUE;
					}
				}
			}

			return FALSE;
		};

		function formatChanged(formats, callback, similar) {
			var currentFormats;

			// Setup format node change logic
			if (!formatChangeData) {
				formatChangeData = {};
				currentFormats = {};

				ed.onNodeChange.addToTop(function(ed, cm, node) {
					var parents = getParents(node), matchedFormats = {};

					// Check for new formats
					each(formatChangeData, function(callbacks, format) {
						each(parents, function(node) {
							if (matchNode(node, format, {}, callbacks.similar)) {
								if (!currentFormats[format]) {
									// Execute callbacks
									each(callbacks, function(callback) {
										callback(true, {node: node, format: format, parents: parents});
									});

									currentFormats[format] = callbacks;
								}

								matchedFormats[format] = callbacks;
								return false;
							}
						});
					});

					// Check if current formats still match
					each(currentFormats, function(callbacks, format) {
						if (!matchedFormats[format]) {
							delete currentFormats[format];

							each(callbacks, function(callback) {
								callback(false, {node: node, format: format, parents: parents});
							});
						}
					});
				});
			}

			// Add format listeners
			each(formats.split(','), function(format) {
				if (!formatChangeData[format]) {
					formatChangeData[format] = [];
					formatChangeData[format].similar = similar;
				}

				formatChangeData[format].push(callback);
			});

			return this;
		};

		// Expose to public
		tinymce.extend(this, {
			get : get,
			register : register,
			apply : apply,
			remove : remove,
			toggle : toggle,
			match : match,
			matchAll : matchAll,
			matchNode : matchNode,
			canApply : canApply,
			formatChanged: formatChanged
		});

		// Initialize
		defaultFormats();
		addKeyboardShortcuts();

		// Private functions

		function matchName(node, format) {
			// Check for inline match
			if (isEq(node, format.inline))
				return TRUE;

			// Check for block match
			if (isEq(node, format.block))
				return TRUE;

			// Check for selector match
			if (format.selector)
				return dom.is(node, format.selector);
		};

		function isEq(str1, str2) {
			str1 = str1 || '';
			str2 = str2 || '';

			str1 = '' + (str1.nodeName || str1);
			str2 = '' + (str2.nodeName || str2);

			return str1.toLowerCase() == str2.toLowerCase();
		};

		function getStyle(node, name) {
			var styleVal = dom.getStyle(node, name);

			// Force the format to hex
			if (name == 'color' || name == 'backgroundColor')
				styleVal = dom.toHex(styleVal);

			// Opera will return bold as 700
			if (name == 'fontWeight' && styleVal == 700)
				styleVal = 'bold';

			return '' + styleVal;
		};

		function replaceVars(value, vars) {
			if (typeof(value) != "string")
				value = value(vars);
			else if (vars) {
				value = value.replace(/%(\w+)/g, function(str, name) {
					return vars[name] || str;
				});
			}

			return value;
		};

		function isWhiteSpaceNode(node) {
			return node && node.nodeType === 3 && /^([\t \r\n]+|)$/.test(node.nodeValue);
		};

		function wrap(node, name, attrs) {
			var wrapper = dom.create(name, attrs);

			node.parentNode.insertBefore(wrapper, node);
			wrapper.appendChild(node);

			return wrapper;
		};

		function expandRng(rng, format, remove) {
			var sibling, lastIdx, leaf, endPoint,
				startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset;

			// This function walks up the tree if there is no siblings before/after the node
			function findParentContainer(start) {
				var container, parent, child, sibling, siblingName, root;

				container = parent = start ? startContainer : endContainer;
				siblingName = start ? 'previousSibling' : 'nextSibling';
				root = dom.getRoot();

				function isBogusBr(node) {
					return node.nodeName == "BR" && node.getAttribute('data-mce-bogus') && !node.nextSibling;
				};

				// If it's a text node and the offset is inside the text
				if (container.nodeType == 3 && !isWhiteSpaceNode(container)) {
					if (start ? startOffset > 0 : endOffset < container.nodeValue.length) {
						return container;
					}
				}

				for (;;) {
					// Stop expanding on block elements
					if (!format[0].block_expand && isBlock(parent))
						return parent;

					// Walk left/right
					for (sibling = parent[siblingName]; sibling; sibling = sibling[siblingName]) {
						if (!isBookmarkNode(sibling) && !isWhiteSpaceNode(sibling) && !isBogusBr(sibling)) {
							return parent;
						}
					}

					// Check if we can move up are we at root level or body level
					if (parent.parentNode == root) {
						container = parent;
						break;
					}

					parent = parent.parentNode;
				}

				return container;
			};

			// This function walks down the tree to find the leaf at the selection.
			// The offset is also returned as if node initially a leaf, the offset may be in the middle of the text node.
			function findLeaf(node, offset) {
				if (offset === undef)
					offset = node.nodeType === 3 ? node.length : node.childNodes.length;
				while (node && node.hasChildNodes()) {
					node = node.childNodes[offset];
					if (node)
						offset = node.nodeType === 3 ? node.length : node.childNodes.length;
				}
				return { node: node, offset: offset };
			}

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes()) {
				lastIdx = startContainer.childNodes.length - 1;
				startContainer = startContainer.childNodes[startOffset > lastIdx ? lastIdx : startOffset];

				if (startContainer.nodeType == 3)
					startOffset = 0;
			}

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes()) {
				lastIdx = endContainer.childNodes.length - 1;
				endContainer = endContainer.childNodes[endOffset > lastIdx ? lastIdx : endOffset - 1];

				if (endContainer.nodeType == 3)
					endOffset = endContainer.nodeValue.length;
			}

			// Expands the node to the closes contentEditable false element if it exists
			function findParentContentEditable(node) {
				var parent = node;

				while (parent) {
					if (parent.nodeType === 1 && getContentEditable(parent)) {
						return getContentEditable(parent) === "false" ? parent : node;
					}

					parent = parent.parentNode;
				}

				return node;
			};

			function findWordEndPoint(container, offset, start) {
				var walker, node, pos, lastTextNode;

				function findSpace(node, offset) {
					var pos, pos2, str = node.nodeValue;

					if (typeof(offset) == "undefined") {
						offset = start ? str.length : 0;
					}

					if (start) {
						pos = str.lastIndexOf(' ', offset);
						pos2 = str.lastIndexOf('\u00a0', offset);
						pos = pos > pos2 ? pos : pos2;

						// Include the space on remove to avoid tag soup
						if (pos !== -1 && !remove) {
							pos++;
						}
					} else {
						pos = str.indexOf(' ', offset);
						pos2 = str.indexOf('\u00a0', offset);
						pos = pos !== -1 && (pos2 === -1 || pos < pos2) ? pos : pos2;
					}

					return pos;
				};

				if (container.nodeType === 3) {
					pos = findSpace(container, offset);

					if (pos !== -1) {
						return {container : container, offset : pos};
					}

					lastTextNode = container;
				}

				// Walk the nodes inside the block
				walker = new TreeWalker(container, dom.getParent(container, isBlock) || ed.getBody());
				while (node = walker[start ? 'prev' : 'next']()) {
					if (node.nodeType === 3) {
						lastTextNode = node;
						pos = findSpace(node);

						if (pos !== -1) {
							return {container : node, offset : pos};
						}
					} else if (isBlock(node)) {
						break;
					}
				}

				if (lastTextNode) {
					if (start) {
						offset = 0;
					} else {
						offset = lastTextNode.length;
					}

					return {container: lastTextNode, offset: offset};
				}
			};

			function findSelectorEndPoint(container, sibling_name) {
				var parents, i, y, curFormat;

				if (container.nodeType == 3 && container.nodeValue.length === 0 && container[sibling_name])
					container = container[sibling_name];

				parents = getParents(container);
				for (i = 0; i < parents.length; i++) {
					for (y = 0; y < format.length; y++) {
						curFormat = format[y];

						// If collapsed state is set then skip formats that doesn't match that
						if ("collapsed" in curFormat && curFormat.collapsed !== rng.collapsed)
							continue;

						if (dom.is(parents[i], curFormat.selector))
							return parents[i];
					}
				}

				return container;
			};

			function findBlockEndPoint(container, sibling_name, sibling_name2) {
				var node;

				// Expand to block of similar type
				if (!format[0].wrapper)
					node = dom.getParent(container, format[0].block);

				// Expand to first wrappable block element or any block element
				if (!node)
					node = dom.getParent(container.nodeType == 3 ? container.parentNode : container, isTextBlock);

				// Exclude inner lists from wrapping
				if (node && format[0].wrapper)
					node = getParents(node, 'ul,ol').reverse()[0] || node;

				// Didn't find a block element look for first/last wrappable element
				if (!node) {
					node = container;

					while (node[sibling_name] && !isBlock(node[sibling_name])) {
						node = node[sibling_name];

						// Break on BR but include it will be removed later on
						// we can't remove it now since we need to check if it can be wrapped
						if (isEq(node, 'br'))
							break;
					}
				}

				return node || container;
			};

			// Expand to closest contentEditable element
			startContainer = findParentContentEditable(startContainer);
			endContainer = findParentContentEditable(endContainer);

			// Exclude bookmark nodes if possible
			if (isBookmarkNode(startContainer.parentNode) || isBookmarkNode(startContainer)) {
				startContainer = isBookmarkNode(startContainer) ? startContainer : startContainer.parentNode;
				startContainer = startContainer.nextSibling || startContainer;

				if (startContainer.nodeType == 3)
					startOffset = 0;
			}

			if (isBookmarkNode(endContainer.parentNode) || isBookmarkNode(endContainer)) {
				endContainer = isBookmarkNode(endContainer) ? endContainer : endContainer.parentNode;
				endContainer = endContainer.previousSibling || endContainer;

				if (endContainer.nodeType == 3)
					endOffset = endContainer.length;
			}

			if (format[0].inline) {
				if (rng.collapsed) {
					// Expand left to closest word boundery
					endPoint = findWordEndPoint(startContainer, startOffset, true);
					if (endPoint) {
						startContainer = endPoint.container;
						startOffset = endPoint.offset;
					}

					// Expand right to closest word boundery
					endPoint = findWordEndPoint(endContainer, endOffset);
					if (endPoint) {
						endContainer = endPoint.container;
						endOffset = endPoint.offset;
					}
				}

				// Avoid applying formatting to a trailing space.
				leaf = findLeaf(endContainer, endOffset);
				if (leaf.node) {
					while (leaf.node && leaf.offset === 0 && leaf.node.previousSibling)
						leaf = findLeaf(leaf.node.previousSibling);

					if (leaf.node && leaf.offset > 0 && leaf.node.nodeType === 3 &&
							leaf.node.nodeValue.charAt(leaf.offset - 1) === ' ') {

						if (leaf.offset > 1) {
							endContainer = leaf.node;
							endContainer.splitText(leaf.offset - 1);
						}
					}
				}
			}

			// Move start/end point up the tree if the leaves are sharp and if we are in different containers
			// Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
			// This will reduce the number of wrapper elements that needs to be created
			// Move start point up the tree
			if (format[0].inline || format[0].block_expand) {
				if (!format[0].inline || (startContainer.nodeType != 3 || startOffset === 0)) {
					startContainer = findParentContainer(true);
				}

				if (!format[0].inline || (endContainer.nodeType != 3 || endOffset === endContainer.nodeValue.length)) {
					endContainer = findParentContainer();
				}
			}

			// Expand start/end container to matching selector
			if (format[0].selector && format[0].expand !== FALSE && !format[0].inline) {
				// Find new startContainer/endContainer if there is better one
				startContainer = findSelectorEndPoint(startContainer, 'previousSibling');
				endContainer = findSelectorEndPoint(endContainer, 'nextSibling');
			}

			// Expand start/end container to matching block element or text node
			if (format[0].block || format[0].selector) {
				// Find new startContainer/endContainer if there is better one
				startContainer = findBlockEndPoint(startContainer, 'previousSibling');
				endContainer = findBlockEndPoint(endContainer, 'nextSibling');

				// Non block element then try to expand up the leaf
				if (format[0].block) {
					if (!isBlock(startContainer))
						startContainer = findParentContainer(true);

					if (!isBlock(endContainer))
						endContainer = findParentContainer();
				}
			}

			// Setup index for startContainer
			if (startContainer.nodeType == 1) {
				startOffset = nodeIndex(startContainer);
				startContainer = startContainer.parentNode;
			}

			// Setup index for endContainer
			if (endContainer.nodeType == 1) {
				endOffset = nodeIndex(endContainer) + 1;
				endContainer = endContainer.parentNode;
			}

			// Return new range like object
			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		}

		function removeFormat(format, vars, node, compare_node) {
			var i, attrs, stylesModified;

			// Check if node matches format
			if (!matchName(node, format))
				return FALSE;

			// Should we compare with format attribs and styles
			if (format.remove != 'all') {
				// Remove styles
				each(format.styles, function(value, name) {
					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(getStyle(compare_node, name), value))
						dom.setStyle(node, name, '');

					stylesModified = 1;
				});

				// Remove style attribute if it's empty
				if (stylesModified && dom.getAttrib(node, 'style') == '') {
					node.removeAttribute('style');
					node.removeAttribute('data-mce-style');
				}

				// Remove attributes
				each(format.attributes, function(value, name) {
					var valueOut;

					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(dom.getAttrib(compare_node, name), value)) {
						// Keep internal classes
						if (name == 'class') {
							value = dom.getAttrib(node, name);
							if (value) {
								// Build new class value where everything is removed except the internal prefixed classes
								valueOut = '';
								each(value.split(/\s+/), function(cls) {
									if (/mce\w+/.test(cls))
										valueOut += (valueOut ? ' ' : '') + cls;
								});

								// We got some internal classes left
								if (valueOut) {
									dom.setAttrib(node, name, valueOut);
									return;
								}
							}
						}

						// IE6 has a bug where the attribute doesn't get removed correctly
						if (name == "class")
							node.removeAttribute('className');

						// Remove mce prefixed attributes
						if (MCE_ATTR_RE.test(name))
							node.removeAttribute('data-mce-' + name);

						node.removeAttribute(name);
					}
				});

				// Remove classes
				each(format.classes, function(value) {
					value = replaceVars(value, vars);

					if (!compare_node || dom.hasClass(compare_node, value))
						dom.removeClass(node, value);
				});

				// Check for non internal attributes
				attrs = dom.getAttribs(node);
				for (i = 0; i < attrs.length; i++) {
					if (attrs[i].nodeName.indexOf('_') !== 0)
						return FALSE;
				}
			}

			// Remove the inline child if it's empty for example <b> or <span>
			if (format.remove != 'none') {
				removeNode(node, format);
				return TRUE;
			}
		};

		function removeNode(node, format) {
			var parentNode = node.parentNode, rootBlockElm;

			function find(node, next, inc) {
				node = getNonWhiteSpaceSibling(node, next, inc);

				return !node || (node.nodeName == 'BR' || isBlock(node));
			};

			if (format.block) {
				if (!forcedRootBlock) {
					// Append BR elements if needed before we remove the block
					if (isBlock(node) && !isBlock(parentNode)) {
						if (!find(node, FALSE) && !find(node.firstChild, TRUE, 1))
							node.insertBefore(dom.create('br'), node.firstChild);

						if (!find(node, TRUE) && !find(node.lastChild, FALSE, 1))
							node.appendChild(dom.create('br'));
					}
				} else {
					// Wrap the block in a forcedRootBlock if we are at the root of document
					if (parentNode == dom.getRoot()) {
						if (!format.list_block || !isEq(node, format.list_block)) {
							each(tinymce.grep(node.childNodes), function(node) {
								if (isValid(forcedRootBlock, node.nodeName.toLowerCase())) {
									if (!rootBlockElm)
										rootBlockElm = wrap(node, forcedRootBlock);
									else
										rootBlockElm.appendChild(node);
								} else
									rootBlockElm = 0;
							});
						}
					}
				}
			}

			// Never remove nodes that isn't the specified inline element if a selector is specified too
			if (format.selector && format.inline && !isEq(format.inline, node))
				return;

			dom.remove(node, 1);
		};

		function getNonWhiteSpaceSibling(node, next, inc) {
			if (node) {
				next = next ? 'nextSibling' : 'previousSibling';

				for (node = inc ? node : node[next]; node; node = node[next]) {
					if (node.nodeType == 1 || !isWhiteSpaceNode(node))
						return node;
				}
			}
		};

		function isBookmarkNode(node) {
			return node && node.nodeType == 1 && node.getAttribute('data-mce-type') == 'bookmark';
		};

		function mergeSiblings(prev, next) {
			var marker, sibling, tmpSibling;

			function compareElements(node1, node2) {
				// Not the same name
				if (node1.nodeName != node2.nodeName)
					return FALSE;

				function getAttribs(node) {
					var attribs = {};

					each(dom.getAttribs(node), function(attr) {
						var name = attr.nodeName.toLowerCase();

						// Don't compare internal attributes or style
						if (name.indexOf('_') !== 0 && name !== 'style')
							attribs[name] = dom.getAttrib(node, name);
					});

					return attribs;
				};

				function compareObjects(obj1, obj2) {
					var value, name;

					for (name in obj1) {
						// Obj1 has item obj2 doesn't have
						if (obj1.hasOwnProperty(name)) {
							value = obj2[name];

							// Obj2 doesn't have obj1 item
							if (value === undef)
								return FALSE;

							// Obj2 item has a different value
							if (obj1[name] != value)
								return FALSE;

							// Delete similar value
							delete obj2[name];
						}
					}

					// Check if obj 2 has something obj 1 doesn't have
					for (name in obj2) {
						// Obj2 has item obj1 doesn't have
						if (obj2.hasOwnProperty(name))
							return FALSE;
					}

					return TRUE;
				};

				// Attribs are not the same
				if (!compareObjects(getAttribs(node1), getAttribs(node2)))
					return FALSE;

				// Styles are not the same
				if (!compareObjects(dom.parseStyle(dom.getAttrib(node1, 'style')), dom.parseStyle(dom.getAttrib(node2, 'style'))))
					return FALSE;

				return TRUE;
			};

			function findElementSibling(node, sibling_name) {
				for (sibling = node; sibling; sibling = sibling[sibling_name]) {
					if (sibling.nodeType == 3 && sibling.nodeValue.length !== 0)
						return node;

					if (sibling.nodeType == 1 && !isBookmarkNode(sibling))
						return sibling;
				}

				return node;
			};

			// Check if next/prev exists and that they are elements
			if (prev && next) {
				// If previous sibling is empty then jump over it
				prev = findElementSibling(prev, 'previousSibling');
				next = findElementSibling(next, 'nextSibling');

				// Compare next and previous nodes
				if (compareElements(prev, next)) {
					// Append nodes between
					for (sibling = prev.nextSibling; sibling && sibling != next;) {
						tmpSibling = sibling;
						sibling = sibling.nextSibling;
						prev.appendChild(tmpSibling);
					}

					// Remove next node
					dom.remove(next);

					// Move children into prev node
					each(tinymce.grep(next.childNodes), function(node) {
						prev.appendChild(node);
					});

					return prev;
				}
			}

			return next;
		};

		function isTextBlock(name) {
			return /^(h[1-6]|p|div|pre|address|dl|dt|dd)$/.test(name);
		};

		function getContainer(rng, start) {
			var container, offset, lastIdx, walker;

			container = rng[start ? 'startContainer' : 'endContainer'];
			offset = rng[start ? 'startOffset' : 'endOffset'];

			if (container.nodeType == 1) {
				lastIdx = container.childNodes.length - 1;

				if (!start && offset)
					offset--;

				container = container.childNodes[offset > lastIdx ? lastIdx : offset];
			}

			// If start text node is excluded then walk to the next node
			if (container.nodeType === 3 && start && offset >= container.nodeValue.length) {
				container = new TreeWalker(container, ed.getBody()).next() || container;
			}

			// If end text node is excluded then walk to the previous node
			if (container.nodeType === 3 && !start && offset === 0) {
				container = new TreeWalker(container, ed.getBody()).prev() || container;
			}

			return container;
		};

		function performCaretAction(type, name, vars) {
			var caretContainerId = '_mce_caret', debug = ed.settings.caret_debug;

			// Creates a caret container bogus element
			function createCaretContainer(fill) {
				var caretContainer = dom.create('span', {id: caretContainerId, 'data-mce-bogus': true, style: debug ? 'color:red' : ''});

				if (fill) {
					caretContainer.appendChild(ed.getDoc().createTextNode(INVISIBLE_CHAR));
				}

				return caretContainer;
			};

			function isCaretContainerEmpty(node, nodes) {
				while (node) {
					if ((node.nodeType === 3 && node.nodeValue !== INVISIBLE_CHAR) || node.childNodes.length > 1) {
						return false;
					}

					// Collect nodes
					if (nodes && node.nodeType === 1) {
						nodes.push(node);
					}

					node = node.firstChild;
				}

				return true;
			};
			
			// Returns any parent caret container element
			function getParentCaretContainer(node) {
				while (node) {
					if (node.id === caretContainerId) {
						return node;
					}

					node = node.parentNode;
				}
			};

			// Finds the first text node in the specified node
			function findFirstTextNode(node) {
				var walker;

				if (node) {
					walker = new TreeWalker(node, node);

					for (node = walker.current(); node; node = walker.next()) {
						if (node.nodeType === 3) {
							return node;
						}
					}
				}
			};

			// Removes the caret container for the specified node or all on the current document
			function removeCaretContainer(node, move_caret) {
				var child, rng;

				if (!node) {
					node = getParentCaretContainer(selection.getStart());

					if (!node) {
						while (node = dom.get(caretContainerId)) {
							removeCaretContainer(node, false);
						}
					}
				} else {
					rng = selection.getRng(true);

					if (isCaretContainerEmpty(node)) {
						if (move_caret !== false) {
							rng.setStartBefore(node);
							rng.setEndBefore(node);
						}

						dom.remove(node);
					} else {
						child = findFirstTextNode(node);

						if (child.nodeValue.charAt(0) === INVISIBLE_CHAR) {
							child = child.deleteData(0, 1);
						}

						dom.remove(node, 1);
					}

					selection.setRng(rng);
				}
			};
			
			// Applies formatting to the caret postion
			function applyCaretFormat() {
				var rng, caretContainer, textNode, offset, bookmark, container, text;

				rng = selection.getRng(true);
				offset = rng.startOffset;
				container = rng.startContainer;
				text = container.nodeValue;

				caretContainer = getParentCaretContainer(selection.getStart());
				if (caretContainer) {
					textNode = findFirstTextNode(caretContainer);
				}

				// Expand to word is caret is in the middle of a text node and the char before/after is a alpha numeric character
				if (text && offset > 0 && offset < text.length && /\w/.test(text.charAt(offset)) && /\w/.test(text.charAt(offset - 1))) {
					// Get bookmark of caret position
					bookmark = selection.getBookmark();

					// Collapse bookmark range (WebKit)
					rng.collapse(true);

					// Expand the range to the closest word and split it at those points
					rng = expandRng(rng, get(name));
					rng = rangeUtils.split(rng);

					// Apply the format to the range
					apply(name, vars, rng);

					// Move selection back to caret position
					selection.moveToBookmark(bookmark);
				} else {
					if (!caretContainer || textNode.nodeValue !== INVISIBLE_CHAR) {
						caretContainer = createCaretContainer(true);
						textNode = caretContainer.firstChild;

						rng.insertNode(caretContainer);
						offset = 1;

						apply(name, vars, caretContainer);
					} else {
						apply(name, vars, caretContainer);
					}

					// Move selection to text node
					selection.setCursorLocation(textNode, offset);
				}
			};

			function removeCaretFormat() {
				var rng = selection.getRng(true), container, offset, bookmark,
					hasContentAfter, node, formatNode, parents = [], i, caretContainer;

				container = rng.startContainer;
				offset = rng.startOffset;
				node = container;

				if (container.nodeType == 3) {
					if (offset != container.nodeValue.length || container.nodeValue === INVISIBLE_CHAR) {
						hasContentAfter = true;
					}

					node = node.parentNode;
				}

				while (node) {
					if (matchNode(node, name, vars)) {
						formatNode = node;
						break;
					}

					if (node.nextSibling) {
						hasContentAfter = true;
					}

					parents.push(node);
					node = node.parentNode;
				}

				// Node doesn't have the specified format
				if (!formatNode) {
					return;
				}

				// Is there contents after the caret then remove the format on the element
				if (hasContentAfter) {
					// Get bookmark of caret position
					bookmark = selection.getBookmark();

					// Collapse bookmark range (WebKit)
					rng.collapse(true);

					// Expand the range to the closest word and split it at those points
					rng = expandRng(rng, get(name), true);
					rng = rangeUtils.split(rng);

					// Remove the format from the range
					remove(name, vars, rng);

					// Move selection back to caret position
					selection.moveToBookmark(bookmark);
				} else {
					caretContainer = createCaretContainer();

					node = caretContainer;
					for (i = parents.length - 1; i >= 0; i--) {
						node.appendChild(dom.clone(parents[i], false));
						node = node.firstChild;
					}

					// Insert invisible character into inner most format element
					node.appendChild(dom.doc.createTextNode(INVISIBLE_CHAR));
					node = node.firstChild;

					// Insert caret container after the formated node
					dom.insertAfter(caretContainer, formatNode);

					// Move selection to text node
					selection.setCursorLocation(node, 1);
				}
			};

			// Checks if the parent caret container node isn't empty if that is the case it
			// will remove the bogus state on all children that isn't empty
			function unmarkBogusCaretParents() {
				var i, caretContainer, node;

				caretContainer = getParentCaretContainer(selection.getStart());
				if (caretContainer && !dom.isEmpty(caretContainer)) {
					tinymce.walk(caretContainer, function(node) {
						if (node.nodeType == 1 && node.id !== caretContainerId && !dom.isEmpty(node)) {
							dom.setAttrib(node, 'data-mce-bogus', null);
						}
					}, 'childNodes');
				}
			};

			// Only bind the caret events once
			if (!self._hasCaretEvents) {
				// Mark current caret container elements as bogus when getting the contents so we don't end up with empty elements
				ed.onBeforeGetContent.addToTop(function() {
					var nodes = [], i;

					if (isCaretContainerEmpty(getParentCaretContainer(selection.getStart()), nodes)) {
						// Mark children
						i = nodes.length;
						while (i--) {
							dom.setAttrib(nodes[i], 'data-mce-bogus', '1');
						}
					}
				});

				// Remove caret container on mouse up and on key up
				tinymce.each('onMouseUp onKeyUp'.split(' '), function(name) {
					ed[name].addToTop(function() {
						removeCaretContainer();
						unmarkBogusCaretParents();
					});
				});

				// Remove caret container on keydown and it's a backspace, enter or left/right arrow keys
				ed.onKeyDown.addToTop(function(ed, e) {
					var keyCode = e.keyCode;

					if (keyCode == 8 || keyCode == 37 || keyCode == 39) {
						removeCaretContainer(getParentCaretContainer(selection.getStart()));
					}

					unmarkBogusCaretParents();
				});

				// Remove bogus state if they got filled by contents using editor.selection.setContent
				selection.onSetContent.add(unmarkBogusCaretParents);

				self._hasCaretEvents = true;
			}

			// Do apply or remove caret format
			if (type == "apply") {
				applyCaretFormat();
			} else {
				removeCaretFormat();
			}
		};

		function moveStart(rng) {
			var container = rng.startContainer,
					offset = rng.startOffset, isAtEndOfText,
					walker, node, nodes, tmpNode;

			// Convert text node into index if possible
			if (container.nodeType == 3 && offset >= container.nodeValue.length) {
				// Get the parent container location and walk from there
				offset = nodeIndex(container);
				container = container.parentNode;
				isAtEndOfText = true;
			}

			// Move startContainer/startOffset in to a suitable node
			if (container.nodeType == 1) {
				nodes = container.childNodes;
				container = nodes[Math.min(offset, nodes.length - 1)];
				walker = new TreeWalker(container, dom.getParent(container, dom.isBlock));

				// If offset is at end of the parent node walk to the next one
				if (offset > nodes.length - 1 || isAtEndOfText)
					walker.next();

				for (node = walker.current(); node; node = walker.next()) {
					if (node.nodeType == 3 && !isWhiteSpaceNode(node)) {
						// IE has a "neat" feature where it moves the start node into the closest element
						// we can avoid this by inserting an element before it and then remove it after we set the selection
						tmpNode = dom.create('a', null, INVISIBLE_CHAR);
						node.parentNode.insertBefore(tmpNode, node);

						// Set selection and remove tmpNode
						rng.setStart(node, 0);
						selection.setRng(rng);
						dom.remove(tmpNode);

						return;
					}
				}
			}
		};
	};
})(tinymce);

tinymce.onAddEditor.add(function(tinymce, ed) {
	var filters, fontSizes, dom, settings = ed.settings;

	function replaceWithSpan(node, styles) {
		tinymce.each(styles, function(value, name) {
			if (value)
				dom.setStyle(node, name, value);
		});

		dom.rename(node, 'span');
	};

	function convert(editor, params) {
		dom = editor.dom;

		if (settings.convert_fonts_to_spans) {
			tinymce.each(dom.select('font,u,strike', params.node), function(node) {
				filters[node.nodeName.toLowerCase()](ed.dom, node);
			});
		}
	};

	if (settings.inline_styles) {
		fontSizes = tinymce.explode(settings.font_size_legacy_values);

		filters = {
			font : function(dom, node) {
				replaceWithSpan(node, {
					backgroundColor : node.style.backgroundColor,
					color : node.color,
					fontFamily : node.face,
					fontSize : fontSizes[parseInt(node.size, 10) - 1]
				});
			},

			u : function(dom, node) {
				replaceWithSpan(node, {
					textDecoration : 'underline'
				});
			},

			strike : function(dom, node) {
				replaceWithSpan(node, {
					textDecoration : 'line-through'
				});
			}
		};

		ed.onPreProcess.add(convert);
		ed.onSetContent.add(convert);

		ed.onInit.add(function() {
			ed.selection.onSetContent.add(convert);
		});
	}
});

(function(tinymce) {
	var TreeWalker = tinymce.dom.TreeWalker;

	tinymce.EnterKey = function(editor) {
		var dom = editor.dom, selection = editor.selection, settings = editor.settings, undoManager = editor.undoManager, nonEmptyElementsMap = editor.schema.getNonEmptyElements();

		function handleEnterKey(evt) {
			var rng = selection.getRng(true), tmpRng, editableRoot, container, offset, parentBlock, documentMode, shiftKey,
				newBlock, fragment, containerBlock, parentBlockName, containerBlockName, newBlockName, isAfterLastNodeInContainer;

			// Returns true if the block can be split into two blocks or not
			function canSplitBlock(node) {
				return node &&
					dom.isBlock(node) &&
					!/^(TD|TH|CAPTION|FORM)$/.test(node.nodeName) &&
					!/^(fixed|absolute)/i.test(node.style.position) && 
					dom.getContentEditable(node) !== "true";
			};

			// Renders empty block on IE
			function renderBlockOnIE(block) {
				var oldRng;

				if (tinymce.isIE && dom.isBlock(block)) {
					oldRng = selection.getRng();
					block.appendChild(dom.create('span', null, '\u00a0'));
					selection.select(block);
					block.lastChild.outerHTML = '';
					selection.setRng(oldRng);
				}
			};

			// Remove the first empty inline element of the block so this: <p><b><em></em></b>x</p> becomes this: <p>x</p>
			function trimInlineElementsOnLeftSideOfBlock(block) {
				var node = block, firstChilds = [], i;

				// Find inner most first child ex: <p><i><b>*</b></i></p>
				while (node = node.firstChild) {
					if (dom.isBlock(node)) {
						return;
					}

					if (node.nodeType == 1 && !nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
						firstChilds.push(node);
					}
				}

				i = firstChilds.length;
				while (i--) {
					node = firstChilds[i];
					if (!node.hasChildNodes() || (node.firstChild == node.lastChild && node.firstChild.nodeValue === '')) {
						dom.remove(node);
					} else {
						// Remove <a> </a> see #5381
						if (node.nodeName == "A" && (node.innerText || node.textContent) === ' ') {
							dom.remove(node);
						}
					}
				}
			};
			
			// Moves the caret to a suitable position within the root for example in the first non pure whitespace text node or before an image
			function moveToCaretPosition(root) {
				var walker, node, rng, y, viewPort, lastNode = root, tempElm;

				rng = dom.createRng();

				if (root.hasChildNodes()) {
					walker = new TreeWalker(root, root);

					while (node = walker.current()) {
						if (node.nodeType == 3) {
							rng.setStart(node, 0);
							rng.setEnd(node, 0);
							break;
						}

						if (nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
							rng.setStartBefore(node);
							rng.setEndBefore(node);
							break;
						}

						lastNode = node;
						node = walker.next();
					}

					if (!node) {
						rng.setStart(lastNode, 0);
						rng.setEnd(lastNode, 0);
					}
				} else {
					if (root.nodeName == 'BR') {
						if (root.nextSibling && dom.isBlock(root.nextSibling)) {
							// Trick on older IE versions to render the caret before the BR between two lists
							if (!documentMode || documentMode < 9) {
								tempElm = dom.create('br');
								root.parentNode.insertBefore(tempElm, root);
							}

							rng.setStartBefore(root);
							rng.setEndBefore(root);
						} else {
							rng.setStartAfter(root);
							rng.setEndAfter(root);
						}
					} else {
						rng.setStart(root, 0);
						rng.setEnd(root, 0);
					}
				}

				selection.setRng(rng);

				// Remove tempElm created for old IE:s
				dom.remove(tempElm);

				viewPort = dom.getViewPort(editor.getWin());

				// scrollIntoView seems to scroll the parent window in most browsers now including FF 3.0b4 so it's time to stop using it and do it our selfs
				y = dom.getPos(root).y;
				if (y < viewPort.y || y + 25 > viewPort.y + viewPort.h) {
					editor.getWin().scrollTo(0, y < viewPort.y ? y : y - viewPort.h + 25); // Needs to be hardcoded to roughly one line of text if a huge text block is broken into two blocks
				}
			};

			// Creates a new block element by cloning the current one or creating a new one if the name is specified
			// This function will also copy any text formatting from the parent block and add it to the new one
			function createNewBlock(name) {
				var node = container, block, clonedNode, caretNode;

				block = name || parentBlockName == "TABLE" ? dom.create(name || newBlockName) : parentBlock.cloneNode(false);
				caretNode = block;

				// Clone any parent styles
				if (settings.keep_styles !== false) {
					do {
						if (/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(node.nodeName)) {
							// Never clone a caret containers
							if (node.id == '_mce_caret') {
								continue;
							}

							clonedNode = node.cloneNode(false);
							dom.setAttrib(clonedNode, 'id', ''); // Remove ID since it needs to be document unique

							if (block.hasChildNodes()) {
								clonedNode.appendChild(block.firstChild);
								block.appendChild(clonedNode);
							} else {
								caretNode = clonedNode;
								block.appendChild(clonedNode);
							}
						}
					} while (node = node.parentNode);
				}

				// BR is needed in empty blocks on non IE browsers
				if (!tinymce.isIE) {
					caretNode.innerHTML = '<br data-mce-bogus="1">';
				}

				return block;
			};

			// Returns true/false if the caret is at the start/end of the parent block element
			function isCaretAtStartOrEndOfBlock(start) {
				var walker, node, name;

				// Caret is in the middle of a text node like "a|b"
				if (container.nodeType == 3 && (start ? offset > 0 : offset < container.nodeValue.length)) {
					return false;
				}

				// If after the last element in block node edge case for #5091
				if (container.parentNode == parentBlock && isAfterLastNodeInContainer && !start) {
					return true;
				}

				// If the caret if before the first element in parentBlock
				if (start && container.nodeType == 1 && container == parentBlock.firstChild) {
					return true;
				}

				// Caret can be before/after a table
				if (container.nodeName === "TABLE" || (container.previousSibling && container.previousSibling.nodeName == "TABLE")) {
					return (isAfterLastNodeInContainer && !start) || (!isAfterLastNodeInContainer && start);
				}

				// Walk the DOM and look for text nodes or non empty elements
				walker = new TreeWalker(container, parentBlock);
	
				// If caret is in beginning or end of a text block then jump to the next/previous node
				if (container.nodeType == 3) {
					if (start && offset == 0) {
						walker.prev();
					} else if (!start && offset == container.nodeValue.length) {
						walker.next();
					}
				}

				while (node = walker.current()) {
					if (node.nodeType === 1) {
						// Ignore bogus elements
						if (!node.getAttribute('data-mce-bogus')) {
							// Keep empty elements like <img /> <input /> but not trailing br:s like <p>text|<br></p>
							name = node.nodeName.toLowerCase();
							if (nonEmptyElementsMap[name] && name !== 'br') {
								return false;
							}
						}
					} else if (node.nodeType === 3 && !/^[ \t\r\n]*$/.test(node.nodeValue)) {
						return false;
					}

					if (start) {
						walker.prev();
					} else {
						walker.next();
					}
				}

				return true;
			};

			// Wraps any text nodes or inline elements in the specified forced root block name
			function wrapSelfAndSiblingsInDefaultBlock(container, offset) {
				var newBlock, parentBlock, startNode, node, next, blockName = newBlockName || 'P';

				// Not in a block element or in a table cell or caption
				parentBlock = dom.getParent(container, dom.isBlock);
				if (!parentBlock || !canSplitBlock(parentBlock)) {
					parentBlock = parentBlock || editableRoot;

					if (!parentBlock.hasChildNodes()) {
						newBlock = dom.create(blockName);
						parentBlock.appendChild(newBlock);
						rng.setStart(newBlock, 0);
						rng.setEnd(newBlock, 0);
						return newBlock;
					}

					// Find parent that is the first child of parentBlock
					node = container;
					while (node.parentNode != parentBlock) {
						node = node.parentNode;
					}

					// Loop left to find start node start wrapping at
					while (node && !dom.isBlock(node)) {
						startNode = node;
						node = node.previousSibling;
					}

					if (startNode) {
						newBlock = dom.create(blockName);
						startNode.parentNode.insertBefore(newBlock, startNode);

						// Start wrapping until we hit a block
						node = startNode;
						while (node && !dom.isBlock(node)) {
							next = node.nextSibling;
							newBlock.appendChild(node);
							node = next;
						}

						// Restore range to it's past location
						rng.setStart(container, offset);
						rng.setEnd(container, offset);
					}
				}

				return container;
			};

			// Inserts a block or br before/after or in the middle of a split list of the LI is empty
			function handleEmptyListItem() {
				function isFirstOrLastLi(first) {
					var node = containerBlock[first ? 'firstChild' : 'lastChild'];

					// Find first/last element since there might be whitespace there
					while (node) {
						if (node.nodeType == 1) {
							break;
						}

						node = node[first ? 'nextSibling' : 'previousSibling'];
					}

					return node === parentBlock;
				};

				newBlock = newBlockName ? createNewBlock(newBlockName) : dom.create('BR');

				if (isFirstOrLastLi(true) && isFirstOrLastLi()) {
					// Is first and last list item then replace the OL/UL with a text block
					dom.replace(newBlock, containerBlock);
				} else if (isFirstOrLastLi(true)) {
					// First LI in list then remove LI and add text block before list
					containerBlock.parentNode.insertBefore(newBlock, containerBlock);
				} else if (isFirstOrLastLi()) {
					// Last LI in list then temove LI and add text block after list
					dom.insertAfter(newBlock, containerBlock);
					renderBlockOnIE(newBlock);
				} else {
					// Middle LI in list the split the list and insert a text block in the middle
					// Extract after fragment and insert it after the current block
					tmpRng = rng.cloneRange();
					tmpRng.setStartAfter(parentBlock);
					tmpRng.setEndAfter(containerBlock);
					fragment = tmpRng.extractContents();
					dom.insertAfter(fragment, containerBlock);
					dom.insertAfter(newBlock, containerBlock);
				}

				dom.remove(parentBlock);
				moveToCaretPosition(newBlock);
				undoManager.add();
			};

			// Walks the parent block to the right and look for BR elements
			function hasRightSideBr() {
				var walker = new TreeWalker(container, parentBlock), node;

				while (node = walker.current()) {
					if (node.nodeName == 'BR') {
						return true;
					}

					node = walker.next();
				}
			}
			
			// Inserts a BR element if the forced_root_block option is set to false or empty string
			function insertBr() {
				var brElm, extraBr;

				if (container && container.nodeType == 3 && offset >= container.nodeValue.length) {
					// Insert extra BR element at the end block elements
					if (!tinymce.isIE && !hasRightSideBr()) {
						brElm = dom.create('br');
						rng.insertNode(brElm);
						rng.setStartAfter(brElm);
						rng.setEndAfter(brElm);
						extraBr = true;
					}
				}

				brElm = dom.create('br');
				rng.insertNode(brElm);

				// Rendering modes below IE8 doesn't display BR elements in PRE unless we have a \n before it
				if (tinymce.isIE && parentBlockName == 'PRE' && (!documentMode || documentMode < 8)) {
					brElm.parentNode.insertBefore(dom.doc.createTextNode('\r'), brElm);
				}

				if (!extraBr) {
					rng.setStartAfter(brElm);
					rng.setEndAfter(brElm);
				} else {
					rng.setStartBefore(brElm);
					rng.setEndBefore(brElm);
				}

				selection.setRng(rng);
				undoManager.add();
			};

			// Trims any linebreaks at the beginning of node user for example when pressing enter in a PRE element
			function trimLeadingLineBreaks(node) {
				do {
					if (node.nodeType === 3) {
						node.nodeValue = node.nodeValue.replace(/^[\r\n]+/, '');
					}

					node = node.firstChild;
				} while (node);
			};

			function getEditableRoot(node) {
				var root = dom.getRoot(), parent, editableRoot;

				// Get all parents until we hit a non editable parent or the root
				parent = node;
				while (parent !== root && dom.getContentEditable(parent) !== "false") {
					if (dom.getContentEditable(parent) === "true") {
						editableRoot = parent;
					}

					parent = parent.parentNode;
				}
				
				return parent !== root ? editableRoot : root;
			};

			// Adds a BR at the end of blocks that only contains an IMG or INPUT since these might be floated and then they won't expand the block
			function addBrToBlockIfNeeded(block) {
				var lastChild;

				// IE will render the blocks correctly other browsers needs a BR
				if (!tinymce.isIE) {
					block.normalize(); // Remove empty text nodes that got left behind by the extract

					// Check if the block is empty or contains a floated last child
					lastChild = block.lastChild;
					if (!lastChild || (/^(left|right)$/gi.test(dom.getStyle(lastChild, 'float', true)))) {
						dom.add(block, 'br');
					}
				}
			};

			// Delete any selected contents
			if (!rng.collapsed) {
				editor.execCommand('Delete');
				return;
			}

			// Event is blocked by some other handler for example the lists plugin
			if (evt.isDefaultPrevented()) {
				return;
			}

			// Setup range items and newBlockName
			container = rng.startContainer;
			offset = rng.startOffset;
			newBlockName = (settings.force_p_newlines ? 'p' : '') || settings.forced_root_block;
			newBlockName = newBlockName ? newBlockName.toUpperCase() : '';
			documentMode = dom.doc.documentMode;
			shiftKey = evt.shiftKey;

			// Resolve node index
			if (container.nodeType == 1 && container.hasChildNodes()) {
				isAfterLastNodeInContainer = offset > container.childNodes.length - 1;
				container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
				if (isAfterLastNodeInContainer && container.nodeType == 3) {
					offset = container.nodeValue.length;
				} else {
					offset = 0;
				}
			}

			// Get editable root node normaly the body element but sometimes a div or span
			editableRoot = getEditableRoot(container);

			// If there is no editable root then enter is done inside a contentEditable false element
			if (!editableRoot) {
				return;
			}

			undoManager.beforeChange();

			// If editable root isn't block nor the root of the editor
			if (!dom.isBlock(editableRoot) && editableRoot != dom.getRoot()) {
				if (!newBlockName || shiftKey) {
					insertBr();
				}

				return;
			}

			// Wrap the current node and it's sibling in a default block if it's needed.
			// for example this <td>text|<b>text2</b></td> will become this <td><p>text|<b>text2</p></b></td>
			// This won't happen if root blocks are disabled or the shiftKey is pressed
			if ((newBlockName && !shiftKey) || (!newBlockName && shiftKey)) {
				container = wrapSelfAndSiblingsInDefaultBlock(container, offset);
			}

			// Find parent block and setup empty block paddings
			parentBlock = dom.getParent(container, dom.isBlock);
			containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;

			// Setup block names
			parentBlockName = parentBlock ? parentBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5
			containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

			// Enter inside block contained within a LI then split or insert before/after LI
			if (containerBlockName == 'LI' && !evt.ctrlKey) {
				parentBlock = containerBlock;
				parentBlockName = containerBlockName;
			}

			// Handle enter in LI
			if (parentBlockName == 'LI') {
				if (!newBlockName && shiftKey) {
					insertBr();
					return;
				}

				// Handle enter inside an empty list item
				if (dom.isEmpty(parentBlock)) {
					// Let the list plugin or browser handle nested lists for now
					if (/^(UL|OL|LI)$/.test(containerBlock.parentNode.nodeName)) {
						return false;
					}

					handleEmptyListItem();
					return;
				}
			}

			// Don't split PRE tags but insert a BR instead easier when writing code samples etc
			if (parentBlockName == 'PRE' && settings.br_in_pre !== false) {
				if (!shiftKey) {
					insertBr();
					return;
				}
			} else {
				// If no root block is configured then insert a BR by default or if the shiftKey is pressed
				if ((!newBlockName && !shiftKey && parentBlockName != 'LI') || (newBlockName && shiftKey)) {
					insertBr();
					return;
				}
			}

			// Default block name if it's not configured
			newBlockName = newBlockName || 'P';

			// Insert new block before/after the parent block depending on caret location
			if (isCaretAtStartOrEndOfBlock()) {
				// If the caret is at the end of a header we produce a P tag after it similar to Word unless we are in a hgroup
				if (/^(H[1-6]|PRE)$/.test(parentBlockName) && containerBlockName != 'HGROUP') {
					newBlock = createNewBlock(newBlockName);
				} else {
					newBlock = createNewBlock();
				}

				// Split the current container block element if enter is pressed inside an empty inner block element
				if (settings.end_container_on_empty_block && canSplitBlock(containerBlock) && dom.isEmpty(parentBlock)) {
					// Split container block for example a BLOCKQUOTE at the current blockParent location for example a P
					newBlock = dom.split(containerBlock, parentBlock);
				} else {
					dom.insertAfter(newBlock, parentBlock);
				}

				moveToCaretPosition(newBlock);
			} else if (isCaretAtStartOrEndOfBlock(true)) {
				// Insert new block before
				newBlock = parentBlock.parentNode.insertBefore(createNewBlock(), parentBlock);
				renderBlockOnIE(newBlock);
			} else {
				// Extract after fragment and insert it after the current block
				tmpRng = rng.cloneRange();
				tmpRng.setEndAfter(parentBlock);
				fragment = tmpRng.extractContents();
				trimLeadingLineBreaks(fragment);
				newBlock = fragment.firstChild;
				dom.insertAfter(fragment, parentBlock);
				trimInlineElementsOnLeftSideOfBlock(newBlock);
				addBrToBlockIfNeeded(parentBlock);
				moveToCaretPosition(newBlock);
			}

			dom.setAttrib(newBlock, 'id', ''); // Remove ID since it needs to be document unique
			undoManager.add();
		}

		editor.onKeyDown.add(function(ed, evt) {
			if (evt.keyCode == 13) {
				if (handleEnterKey(evt) !== false) {
					evt.preventDefault();
				}
			}
		});
	};
})(tinymce);


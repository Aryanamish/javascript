((undefined)=>{
    var initiate = false;
    let root = typeof self == 'object' && self.self === self && self ||
			typeof global == 'object' && global.global === global && global ||
			this ||
			{};

    let private_fun = {
            previousMap: {},
            executeShortcut: function (obj, menuInstance) {
                let shortcutKeys = menuInstance.shortcutKeys;
                let l = shortcutKeys.length;
                for (let i = 0; i < l; i++) {
                    let matched = true;
                    let keys = shortcutKeys[i][1];
                    let l2 = keys.length;
                    for (let j = 0; j < l2; j++) {
                        if (obj[keys[j]]!==true) {
                            matched = false;
                            break;
                        }
                    }
                    if (matched === true) {
                        shortcutKeys[i][0].click();
                        break;
                    }
                }
            },
            keypress: function (menuInstance) {
                let handler = {
                    set: (obj, prop, value) => {
                        obj[prop] = value;
                        if (this.previousMap[prop] !== value) {
                            this.executeShortcut(obj, menuInstance);
                        } else {
                            //nothing
                        }
                        Object.assign(this.previousMap, obj);
                    }
                };
                RightClickMenu.prototype.map = new Proxy(RightClickMenu.prototype.map, handler);

                root.onkeydown = root.onkeyup = function (e) {
                    e = e || root.event; // to deal with IE
                    RightClickMenu.prototype.map[e.key.toLowerCase()] = e.type === 'keydown';


                }
            },


        };

    const RightClickMenu = function(){
        this.menuFunction = {};
        this.target = [];
        this.shortcutKeys = [];
        let handler = {
            set: (obj, prop, value)=>{
                obj.push(value);
                RightClickMenu.prototype.menuObj(this.menuId, value, this.buttonTag);
            }
        };
        this.target = new Proxy(this.target, handler);
    };
    RightClickMenu.prototype.instances = [];
    RightClickMenu.prototype.map = [];
    RightClickMenu.prototype.version = '0.0.1';
    RightClickMenu.prototype.menuObj = function(menu_id, target_selector, button_tag) {
        RightClickMenu.prototype.instances.push(this);
        this.menuId = menu_id;
        this.buttonTag = button_tag;
        this.target.push(target_selector);
        let menu = menu_id !== undefined ? document.getElementById(menu_id) : undefined;
        if (menu !== undefined) {
            let target_obj = target_selector !== undefined ? document.querySelectorAll(target_selector) : root;
            target_obj.forEach(e => {
                e.addEventListener("contextmenu", function (e) {
                    e.preventDefault();     // prevent the default action of right click
                    menu.style.top = e.clientY + "px";
                    menu.style.left = e.clientX + "px";
                    menu.style.display = "block";
                });
            });

            menu.querySelectorAll(button_tag).forEach(e => {
                let fun;
                if (e.hasAttribute('fun')) {
                    fun = e.attributes.fun.value;
                } else {
                    fun = e.innerText;
                }
                if (!this.menuFunction[fun] instanceof Function) {
                    this.menuFunction[fun] = ()=>{console.warn("Function name "+ fun + 'doseNotExist')};
                }
                e.addEventListener('click', this.menuFunction[fun]);



                if (e.hasAttribute('shortcut')) {
                    this.shortcutKeys.push([
                            e,
                            e.attributes.shortcut.value.toLowerCase().split('+').filter(e => {
                                if (e === 'control') {
                                    return 'ctrl';
                                } else {
                                    return e;
                                }
                            })
                        ]
                    );
                }

            });

            if(!initiate){
                private_fun.keypress(this);
                initiate = true;
            }

        }
        };

        root.RightClickMenu = RightClickMenu;
})();




(function(undefined){
    let option = {
        target:[],
        menuObj: '',
        buttonTag: '',

    };
    window.test = function(){

    }
})();
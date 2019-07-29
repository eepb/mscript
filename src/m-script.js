/***************************************************************************
 * 
 * M-Script Javascript Library
 * Easy, light and fast
 *  
 **************************************************************************/
const m$ = {
    data: {},
    databind: (data, name) => {
        m$.__private.data[name] = data;
        m$.__private.applyData(data, name);
    },
    transferredData: {},
    init: function (parent, options) {
        if (parent === undefined)
            parent = 'body';

        options = options || {};
        this.__private.pagemaps.init(options.pagemaps);
        this.__private.permissionMethod = this.__private.permissionMethod || options.permissionMethod;

        _parent = $(parent);
        _parent.find('[m-data],[m-data-item],[m-hidden],[m-show],[m-hide]').hide();
        _parent.find('[m-enabled]').addClass('m-disabled');
        _parent.find('select > option[m-data]').attr('disabled', 'disabled');

        this.__private.createDataProperties(parent);
        this.__private.page.replace(parent);
        this.view.init.mountLink(parent);
    },
    toggle: function (togglegroup) {
        const active = function (toggleid) {
            $('[m-toggle-group="' + togglegroup + '"] [m-toggle-id]').each((i, item) => {
                if ($(item).attr('m-toggle-id') === toggleid) {
                    $(item).removeClass('m-desactive');
                } else {
                    $(item).addClass('m-desactive');
                }
            });
        };

        return {
            active: active
        };
    },
    view: {
        cache: null,
        init: {
            loadDefaultPage: () => {
                m$.view.getElement().each((i, elem) => {
                    const _page = $(elem).attr('m-view-page-default');
                    m$.page.target(_page, elem);
                });
            },
            mountLink: (parent) => {
                $(parent).find('[m-view-target]').click(function (event) {
                    if (event.preventDefault !== undefined)
                        event.preventDefault();

                    const _attrs = m$.view.attrs(this);

                    m$.view.load(_attrs.page, {
                        target: _attrs.target,
                        data: m$.transferredData
                    });
                });
            }
        },
        getElement: function (target) {
            return target === undefined ?
                $('[m-view="main"]') :
                $('[m-view="' + target + '"]');
        },
        attrs: function (elem) {
            return {
                page: $(elem).attr('m-view-page'),
                target: $(elem).attr('m-view-target')
            };
        },
        load: function (page, options) {
            options = options || {};
            m$.transferredData = options.data;

            //guarda no cache a última url
            if (this.cache === null)
                this.cache = m$.cache();

            m$.view.cache.set('page', page);

            const view = this.getElement(options.target);
            const call = function () {
                for (var prop in options.data) {
                    m$.__private.applyData(options.data[prop], prop);
                }
            };

            m$.page.target(page, view, [options.callback, call]);
        },
        reload: function (target) {
            if (!this.cache)
                return;

            if (this.cache.exists('page')) {
                const page = this.cache.get('page');
                this.load(page, {
                    target: target,
                    data: m$.transferredData
                });
            }
        },
        empty: function (target) {
            this.getElement(target).empty();
        }
    },
    cache: function () {
        return {
            data: {},
            clean: function (key) {
                if (key === undefined) {
                    this.data = {};
                } else {
                    delete this.data[key];
                }
                return this;
            },
            set: function (key, data) {
                this.data[key] = data;
            },
            add: function (key, data) {
                if (this.exists(key)) {
                    this.data[key] = this.data[key].concat(data);
                } else {
                    this.set(key, data);
                }
            },
            get: function (key) {
                if (this.exists(key)) {
                    return this.data[key];
                }
            },
            exists: function (key) {
                if (this.data !== undefined) {
                    if (this.data[key] !== undefined && this.data[key] !== null) {
                        return true;
                    }
                }
                return false;
            },
            length: function (key) {
                if (this.get(key) !== undefined) {
                    return this.get(key).length;
                }
                return 0;
            }
        };
    },
    form: {
        get inputs () {
            return 'input[type="text"][id],input[type="password"][id],input[type="number"][id],select[id]';
        },
        get: function (parent) {
            if (parent === undefined)
                parent = 'body';

            let _form = {};
            $(parent)
                .find(this.inputs)
                .not('[m-data]')
                .each(function (i, elem) {
                    const value = $(elem).val();
                    if (value !== "") {
                        m$.__private.object.set(_form, elem.id, value);
                    }
                });
            return _form;
        },
        set: function (args) {
            if (args.parent === undefined)
                args.parent = 'body';

            const f = function (obj, prop) {
                if (typeof obj === 'object') {
                    for (var o in obj) {
                        f(obj[o], prop + '.' + o);
                    }
                } else {
                    $(args.parent)
                        .find('[id="' + prop.substring(1) + '"]')
                        .not('[m-data]')
                        .val(obj);
                }
            };
            f(args.data, '');
        },
        clean: function () {
            $(this.inputs).each(function (i, elem) {
                $(elem).val('');
            });
        }
    },
    http: {
        screen: {
            count: 0,
            disable: function () {
                this.count++;
                $('body').addClass('m-http-disabled');
            },
            enable: function () {
                this.count--;
                if (this.count === 0) {
                    $('body').removeClass('m-http-disabled');
                }
            }
        },
        done: (response, callbackSuccess) => {
            m$.http.screen.enable();
            //const m$obj = $.parseJSON(response);
            callbackSuccess(response);
        },
        fail: (erro, callbackError) => {
            m$.http.screen.enable();
            callbackError(erro);

            if (erro.responseText !== undefined)
                console.log(erro.responseText);
            if (erro.responseJSON !== undefined)
                console.log(erro.responseJSON);
        },
        getAsync: function (url, callbackSuccess, callbackError) {
            this.screen.disable();
            $.ajax({
                method: "GET",
                url: url,
                dataType: "json",
                contentType: "application/json; charset=utf-8"
            }).done(function (response) {
                m$.http.done(response, callbackSuccess);
            }).fail(function (erro) {
                m$.http.fail(erro, callbackError);
            });
        },
        postAsync: function (url, data, callbackSuccess, callbackError) {
            this.screen.disable();
            $.ajax({
                method: "POST",
                url: url,
                dataType: "json",
                data: data,
                contentType: "application/json; charset=utf-8"
            }).done(function (response) {
                m$.http.done(response, callbackSuccess);
            }).fail(function (erro) {
                m$.http.fail(erro, callbackError);
            });
        },
        get: function (url, callbackSuccess, callbackError) {
            this.screen.disable();
            $.ajax({
                method: "GET",
                async: false,
                url: url,
                dataType: "json",
                contentType: "application/json; charset=utf-8"
            }).done(function (response) {
                m$.http.done(response, callbackSuccess);
            }).fail(function (erro) {
                m$.http.fail(erro, callbackError);
            });
        },
        post: function (url, data, callbackSuccess, callbackError) {
            this.screen.disable();
            $.ajax({
                method: "POST",
                async: false,
                url: url,
                dataType: "json",
                data: data,
                contentType: "application/json; charset=utf-8"
            }).done(function (response) {
                m$.http.done(response, callbackSuccess);
            }).fail(function (erro) {
                m$.http.fail(erro, callbackError);
            });
        }
    },
    page: {
        target: (pagename, element, callback) => {
            m$.page.get(pagename, (loadedPage) => {
                $(element).html(loadedPage);

                if (typeof callback === 'function') {
                    callback(loadedPage);
                } else if (typeof callback === 'object') {
                    for (var i = 0; i < callback.length; i++) {
                        if (typeof callback[i] === 'function') {
                            callback[i](loadedPage);
                        }
                    }
                }
            });
        },
        get: (pagename, callback) => {
            const page = m$.__private.pagemaps.getPage(pagename);
            if (page === undefined) alert(pagename + ' is undefined');

            $.get(page, (loadedPage) => {
                const loaded = $(loadedPage);
                if (typeof m$.__private.permissionMethod === 'function') {
                    m$.__private.permissionMethod(loaded);
                }
                m$.init(loaded);
                if (typeof callback === 'function') {
                    callback(loaded);
                }
            });
        },
        append: (pagename, element, callback) => {
            const page = m$.__private.pagemaps.getPage(pagename);
            if (page === undefined) alert(pagename + ' is undefined');

            $.get(page, (loadedPage) => {
                const loaded = $(loadedPage);
                if (typeof m$.__private.permissionMethod === 'function') {
                    m$.__private.permissionMethod(loaded);
                }
                m$.init(loaded);
                if (typeof callback === 'function') {
                    callback(loaded);
                }

                $(element).append(loaded);
            });
        }
    },
    queryString: {
        get: (name) => {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (results !== null) {
                return results[1] || undefined;
            }
        }
    },
    util: {
        inputInt: () => {
            $(".m-int").on("keypress keyup blur", function (event) {
                $(this).val($(this).val().replace(/[^\d].+/, ""));
                if ((event.which < 48 || event.which > 57)) {
                    event.preventDefault();
                }
            });
        }
    },
    get html() {
        const procure = (element, attr) => {
            let array = [];
            $(element)
            .children(':not([m-data-item]:not([' + attr + '^="^"])):not([m-data]:not([' + attr + '])):not([m_data])')
            .each((i, elem) => {
                const el = $(elem);
                if (el.is('[' + attr + ']')) {
                    array.push(el);
                }
                if (!el.is('[m-data-item]') && !el.is('[m-data]')) {
                    array = array.concat(procure(el, attr));
                }
            });
            return array;
        };

        return {
            if: (element, data) => {
                const array = procure(element, 'm-if');

                array.forEach((elem) => {
                    if (!m$.__private.math.satisfiedCondition(elem, data, 'm-if')) {
                        $(elem).remove();
                    } 
                    // else {
                    //     $(elem).removeAttr('m-if');
                    // }
                });
                
                return $(element).attr('m-if') ? m$.__private.math.satisfiedCondition(element, data, 'm-if'): true;
            },
            enable: (element, data) => {
                let array = procure(element, 'm-enabled');

                array.forEach((elem) => {
                    if (m$.__private.math.satisfiedCondition(elem, data, 'm-enabled')) {
                        $(elem).removeClass('m-disabled');
                    } else {
                        $(elem).addClass('m-disabled');
                    }
                });

                array = procure(element, 'm-disabled');

                array.forEach((elem) => {
                    if (m$.__private.math.satisfiedCondition(elem, data, 'm-disabled')) {
                        $(elem).addClass('m-disabled');
                    } else {
                        $(elem).removeClass('m-disabled');
                    }
                });
            },
            display: (element, data) => {
                let array = procure(element, 'm-show');

                array.forEach((elem) => {
                    if (m$.__private.math.satisfiedCondition(elem, data, 'm-show')) {
                        $(elem).show();
                    } else {
                        $(elem).hide();
                    }
                });

                array = procure(element, 'm-hide');

                array.forEach((elem) => {
                    if (m$.__private.math.satisfiedCondition(elem, data, 'm-hide')) {
                        $(elem).hide();
                    } else {
                        $(elem).show();
                    }
                });
            },
            selectedValue: (element, data) => {
                $(element).find('select[m-value]').each((i, item) => {
                    const value = String(data[$(item).attr('m-value')]);
                    //$(item).find('option').filter((i,o)=> {
                    //    return $(o).val() === value;
                    //}).prop('selected', true);
                    $(item).find('option[value="' + value + '"]').attr('selected', 'selected');
                    //$(item).val(String(data[$(item).attr('m-value')]));
                });
            },
            replace: (html, json) => {
                return html.replace(/{{(.*?)}}/g, function (exp, value) {
                    const array = value.split('||');
                    for (var i = 0; i < array.length; i++) {
                        return m$.__private.object.get(json, array[i].trim()) || '';
                    }
                    return '';
                });
            }
        };
    },
    __private: {
        data: {},
        maps: {},
        pagemaps: {
            init: (json) => {
                json = json || m$.__private.maps;
                if (typeof json === 'string') {
                    json = JSON.parse(json);
                }
                m$.__private.maps = json;
            },
            getPage: (page) => {
                const pg = page.split('.');
                if (pg[0] === 'pagemaps') {
                    return m$.__private.maps[pg[1]];
                }
                return page;
            }
        },
        permissionMethod: undefined,
        createDataProperties: (element) => {
            $(element).find('[m-data]').each((i, elem) => {
                const name = $(elem).attr('m-data');
                if (m$.data.hasOwnProperty(name) === false) {
                    Object.defineProperty(m$.data, name, {
                        get: function () {
                            return m$.__private.data[name];
                        },
                        set: function (data) {
                            m$.__private.data[name] = data;
                            //m$.__private.applyData(data, name);
                        }
                    });
                }
            });
        },
        math: {
            containsNegationOperator: function (text) {
                const constant = text.value.match(/^!(.*?)$/);
                if (constant !== null) {
                    text.value = constant[1];
                    return true;
                }
                return false;
            },
            containsParentOperator: function (text) {
                const constant = text.value.match(/^\^(.*?)$/);
                if (constant !== null) {
                    text.value = constant[1];
                    return true;
                }
                return false;
            },
            isConstant: function (text) {
                const constant = text.value.match(/^('|")(.*?)('|")$/);
                if (constant !== null) {
                    text.value = constant[2];
                    return true;
                }
                return false;
            },
            isNumeric: function (text) {
                if ($.isNumeric(text.value)) {
                    text.value = Number.parseInt(text.value);
                    return true;
                }
                return false;
            },
            isBoolean: function (text) {
                switch (text.value) {
                    case 'true':
                        text.value = true;
                        return true;
                    case 'false':
                        text.value = false;
                        return true;
                    default:
                        return false;
                }
            },
            isEqual: function (equal, data) {
                let satisfied = false;
                if (equal.length === 1) { //m-show="a"
                    const text = { value: equal[0].trim() };
                    if (m$.__private.math.containsNegationOperator(text)) {
                        satisfied = !(data[text.value] ? true : false);
                    } else {
                        satisfied = data[text.value] ? true : false;
                    }
                } else { //m-show="a==b,c"  value1==value2
                    const prop = { value: equal[0].trim() };
                    const isParentProperty = m$.__private.math.containsParentOperator(prop);
                    const value1 = m$.__private.object.get(data, prop.value);
                    /* Quanto a propriedade se refere ao objeto pai e a propriedade no objeto filho não existe */
                    if (isParentProperty === true && value1 === undefined){
                        return true;
                    }

                    const b = equal[1].split(',');//equivalente a 'ou'
                    for (var j = 0; j < b.length; j++) {
                        const text = { value: b[j].trim() };
                        let value2 = text.value === 'null' ? null : text.value;
                        if (value2 !== null) {
                            const _value2 = data[text.value];
                            if (_value2 === undefined) {
                                if (m$.__private.math.isConstant(text)) {
                                    value2 = text.value;
                                } else if (m$.__private.math.isBoolean(text)) {
                                    value2 = text.value;
                                } else if (m$.__private.math.isNumeric(text)) {
                                    value2 = text.value;
                                }
                            } else {
                                value2 = _value2;
                            }
                        }
                        //const value1 = m$.__private.object.get(data, equal[0].trim());
                        if (value1 === value2) {
                            satisfied = true;
                            break;
                        }
                    }
                }
                return satisfied;
            },
            satisfiedCondition: function (elem, data, attr) {
                let satisfied = false;
                const prop = $(elem).attr(attr);
                const ands = prop.split('&&');
                for (var i = 0; i < ands.length; i++) {
                    let termos = ands[i].split('!=');
                    if (termos.length === 2) {
                        satisfied = !m$.__private.math.isEqual(termos, data);
                    } else {
                        termos = ands[i].split('==');
                        satisfied = m$.__private.math.isEqual(termos, data);
                    }
                    if (satisfied === false) break;
                }
                return satisfied;
            }
        },
        object: {
            obj: (data, str, value) => {
                const array = str.split('.');
                let obj = data;
                for (var j = 0; j < array.length - 1; j++) {
                    obj = obj[array[j]] = obj[array[j]] || {};
                    //if (obj === undefined) return;
                }
                if (value !== undefined) {
                    obj[array[array.length - 1]] = value;
                } else {
                    return obj[array[array.length - 1]];
                }
            },
            get: (data, str) => {
                const val = m$.__private.object.obj(data, str);
                if (val === undefined) {
                    const text = { value: str };
                    if (m$.__private.math.isConstant(text)) {
                        return text.value;
                    }
                    return val;
                }
                return val;
            },
            set: (data, str, value) => {
                m$.__private.object.obj(data, str, value);
            }
        },
        applyData: (data, name) => {
            this.referenceModel = {
                get: function (name = name) {
                    if (typeof name === 'object') return $(name);
                    return $('[m-data="' + name + '"');
                },
                html: function (elemid) {
                    return $('<div />').append(
                        $(elemid).clone().removeAttr('m-data-item m-data disabled').show()
                    ).html();
                },
                showParents: function (elemid) {
                    $(elemid).parents('[m-hidden]').show();
                }
            };

            this.generate = function (model, data, attr) {
                data = data || {};

                $('[m_data="' + attr + '"]').remove();

                const array = [];
                $(data).each((i, obj) => {
                    obj['m$index'] = i + 1;

                    const clonedModel = $(model).clone();

                    const includeCurrentElement = m$.html.if(clonedModel, obj);
                    if (includeCurrentElement === false) return array;

                    $(clonedModel).find('[m-data-item]').each((i, _model) => {
                        const _attr = $(_model).attr('m-data-item');
                        const _data = m$.__private.object.get(obj, _attr);
                        if (_data !== undefined) {
                            const array = generate(_model, _data, attr + '.' + _attr);
                            $(_model).before(array);
                            $(_model).remove();
                        }
                    });

                    const html = referenceModel.html(clonedModel);
                    let created = $(m$.html.replace(html, obj));
                    m$.html.display(created, obj);
                    m$.html.enable(created, obj);
                    m$.html.selectedValue(created, obj);
                    m$.view.init.mountLink(created);

                    created = created.attr('m_data', attr);
                    array.push(created);
                });
                return array;
            };

            this.removeChildren = function (model) {
                const attr = $(model).attr('m-children');
                if (attr !== undefined) {
                    const children = attr.split(',');
                    children.forEach((child) => {
                        removeChildren(referenceModel.get(child));
                        $('[m_data="' + child + '"]').remove();
                    });
                }
            };

            (function () {
                const models = referenceModel.get(name);

                models.each((i, model) => {
                    const array = generate($(model).clone(), data, name);
                    referenceModel.showParents(model);
                    $(model).before(array);
                });

                //children data
                models.each((i, model) => {
                    removeChildren(model);
                });

            })();
        },
        page: {
            replace: (element) => {
                $(element).find('[m-page-replace]').each((i, elem) => {
                    const page = $(elem).attr('m-page-replace');
                    m$.page.target(page, elem);
                });
            }
        }
    }
};
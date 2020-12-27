(function(undefined){
    //root is windows
    let root = typeof self == 'object' && self.self === self && self ||
			typeof global == 'object' && global.global === global && global ||
			this ||
			{};



    const randomWord = function (length) {
                       var result           = '';
                       var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                       var charactersLength = characters.length;
                       for ( var i = 0; i < length; i++ ) {
                          result += characters.charAt(Math.floor(Math.random() * charactersLength));
                       }
                       return result;
                    }
    let unioun = function (x) { return x. filter(function(elem, index) { return x. indexOf(elem) === index; }); };
    let startTime = 0;
    let performanceCheck = false;
    /*
    creates Dom element and return the element
        takes parameter as object
        eg:     parameter = {
                element:"div", //element name
                attribute:"class=drag:id=dragme",  //its attributes seprated with colon
                innerhtml: "hi the is inner html",  //sets the innerhtml of the element
                htmlObj:[createElement(params)] //takes array as value
                }
    */

    // function createElement(obj){
    //     //if element parameter is defined
    //     if(obj.element){
    //       var elmnt = document.createElement(obj.element);
    //     }else{
    //       if(DEBUG) console.log("obj.element is not defined"+obj);
    //       return undefined;
    //     }
    //
    //     //if element attributes are defined else no attribute will be set
    //     if(obj.attribute){
    //         if(typeof obj.attribute === 'function'){
    //             obj.attribute = obj.attribute();
    //         }
    //       if(obj.attribute.charAt(obj.attribute.length-1) == ":?:"){
    //         obj.attribute = obj.attribute.substr(0,attribute.length-1);
    //       }
    //
    //       var b = obj.attribute.split(":?:");
    //       b.forEach(function(e){
    //       var c = e.split("=");
    //         var att = document.createAttribute(c[0]);
    //         att.value = c[1];
    //         elmnt.setAttributeNode(att);
    //       })
    //     }
    //
    //     //if innerhtml is defined
    //     if(obj.innerhtml){
    //       elmnt.innerHTML = obj.innerhtml;
    //     }
    //
    //     //if htmlobject is given to append in the element
    //     if(obj.htmlObj){
    //       obj.htmlObj.forEach(function(e){
    //         elmnt.appendChild(e);
    //       })
    //
    //     }
    //     return elmnt;
    // }



        //it returns attr from the given obj i.e removes some properties
        //such as html,event,<>
     function _attr(attr){
        attr = Object.assign({}, attr);
        delete attr['<>'];
        delete attr['html'];
        delete attr['event'];
        delete attr['wrap'];
        let attribute = '';
        for(let i in attr){
            attribute += i + "=" + attr[i] + ':?:';
        }
        return attribute;
    }

    var isTable = false;


    function render(temp){
        let x = temp['<>'].toLowerCase();
        if(x==='tr' || x==='th' || x==='td' || x==='tbody' || x==='thead'){
            isTable = true;
        }
        if(temp.event!== undefined){
            for(let i in temp.event){
                let e = temp.event[i];
                temp["on" + i] = typeof e ==='function' ? "(" + e + ")()" : e.slice(-2)==="()"? e : e+"()";
            }
        }

        let tagObject = {
            element: temp['<>'],
            attribute:  _attr(temp),
        };

        if(temp.html !== undefined && typeof temp.html === 'object') {



            let l = temp.html.length;
            tagObject.htmlObj = [];
            for (let i = 0; i < l; i++) {
                let tag = createElement(render(temp.html[i]));

                tagObject.htmlObj.push(tag)
            }
        }else{
            tagObject.innerhtml = temp.html;
        }

        if (temp.wrap && isTable === false) {
            tagObject = {
                element: temp.wrap['<>'],
                attribute: _attr(temp.wrap),
                htmlObj: [createElement(tagObject)]
            };
        }
        return tagObject;
    }


    function stuffDataInTemplate(temp_str, data, keyRefName){
         let matchCase = temp_str.match(/[aA-zZ0-9_]*(?=})(?!={)/gi);
         matchCase = matchCase === null ? [] : matchCase.filter(function(e){return e !== ""});
         let stringReplace = unioun(matchCase);
         let finished_string = '';
         if(Array.isArray(data)===true){
             let l = data.length;
             for(let i=0;i<l;i++){
                 finished_string += temp_str.format(data[i]);
             }
         }else {
             if (stringReplace.length !== 0) {
                 let l = data.length;
                 let dict = {};


                 for (let i = 0; i < l; i++) {
                     dict[keyRefName] = i;
                     if (stringReplace.length * 2.3 <= Object.keys(data[i]).length) {
                         let l1 = stringReplace.length;
                         for (let j = 0; j < l1; j++) {
                             dict[stringReplace[j]] = data[i][stringReplace];
                         }
                         finished_string += temp_str.format(dict);
                     } else {
                         finished_string += temp_str.format(data[i]);
                     }

                 }
             } else {
                 finished_string = temp_str;
             }
         }

         return finished_string;
     }

    function appendElement(parent, tag){
        if(typeof tag ==='string'){
            parent.innerHTML += tag;
        }else{
            parent.append(tag);
        }
    }

    function checkOption(temp_str, option) {
        if(isTable && option.table === true){
            temp_str = "<table>" + temp_str + "</table>";
        }
        if (option.parent !== undefined) {
            appendElement(option.parent,temp_str);
            return true;
        } else if (option.parentId !== undefined) {
            appendElement(document.getElementById(option.parentId), temp_str);
            return true;
        }else if(option.parentClass !== undefined){
            document.querySelectorAll(option.parentClass).forEach(function(e){
                appendElement(e,temp_str)
            });
            return true;
        }
        if(option.wrap !== undefined){
            let wrap = render(option.wrap);
            wrap.innerhtml = temp_str;
            wrap = createElement(wrap);
            temp_str = wrap.innerhtml;
        }


        if (option.output.toLowerCase() === 'html') {
            if(isTable){
                temp_str = "<table>" + temp_str + "</table>";
            }
            temp_str = new DOMParser().parseFromString(temp_str, 'text/html').body;
        }
        return temp_str;
    }



    root.Json2Html = {
        version: '0.0.1',
        html: function(template, raw_data=undefined, _option ){

            let option = {
                output: 'str',
                parent: undefined,
                parentId: undefined,
                header: undefined,
                keyRefName: 'objKey',
                wrap:undefined,
                parentClass: undefined,
                performance: false,
                table:true,
                };
            option = {...option,..._option};
            if(option.performance === true){
                performanceCheck = true;
                startTime = performance.now();
            }

            template = Object.assign({}, template);
            isTable = false;
            let data = typeof raw_data === 'string'? JSON.parse(raw_data): raw_data;

            if(template !== undefined){
                var tag = createElement(render(template));
            }

            let finished_tag = stuffDataInTemplate(tag.outerHTML, data, option.keyRefName);

            if(performanceCheck === true){
                console.log(performance.now()-startTime + " ms");
            }
            return checkOption(finished_tag, option);


        },


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        json2table: function(data, header, _option) {

            let option = tableOption(_option);
            let optionStore = option[1];
            option = option[0];

            let tr = {'<>':'tr','html':[]};
            let td ='';
            if(option.td !== undefined){
                td = option.td;
            }else{
                if(option.edit === true){
                    td = option.editBlock
                }else{
                    td = option.dataBlock;
                }
            }
            let headerTag = '';
            if(header!== false & option.returnHeader === true){
                headerTag = this.html(option.th ,header, option);
                headerTag = "<tr>" + headerTag + "</tr>";
            }

            let body = '';
            if(typeof td ==='object'){
                body = JSON.stringify(td);
            }

            let l = header.length;
            let tdHtml = '';
            for (let i=0;i<l;i++){
                let a = body.replace(new RegExp("\\$\\{"+ option.headerRefName +"\\}",'g'), header[i]);
                a = a.replace(/\${[aA-zA0-9_]*}/g, "${" + header[i] + "}");
                tdHtml += a + ",";
            }
            tdHtml = '[' + tdHtml.replace(/,*$/g, "") + "]";
            tr.html = JSON.parse(tdHtml);
            let bodyTag = this.html(tr, data, option);
            option = {...option,...optionStore};
            option.table = option.returnTable;
            let finished_tag = headerTag + bodyTag;
            return checkOption(finished_tag ,option);
        },

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        table2json: function(tableElement, header, format){
            let dataVerify = false;
            if(Array.isArray(header)){
                dataVerify = true;
            }else{
                throw "header requires Array ("+ typeof header + ") given.";
            }

            if (dataVerify) {
                tableElement = getTableTag(tableElement);
                let data = extract_val(tableElement, header);
                return data;
            }
        }

    };

    function tableOption(_option){
        let option = {
            edit: false,
            editBlock: {
                '<>': 'td',
                'class': '${headerValue}',
                'html': [{'<>': 'input', 'type': 'text', 'value': '${}'}]
            },
            dataBlock: {'<>': 'td', 'class': '${headerValue}', 'html': [{'<>': 'span', 'html': '${}'}]},
            th: {'<>': 'th', 'html': '${0}'},
            td: undefined,
            headerRefName:'headerValue',
            output: 'str',
            parent: undefined,
            parentId: undefined,
            wrap:undefined,
            parentClass: undefined,
            performance: false,
            returnTable:true,
            returnHeader:true,
            };

            option = {...option, ..._option};
            option.table = false;
            let optionStore = {};
            optionStore['parentId'] = option.parentId; delete option.parentId;
            optionStore['parent'] = option.parent; delete option.parent;
            optionStore['parentClass'] = option.parentClass; delete option.parentClass;
            optionStore['output'] = option.output; delete option.output;

            option.output = 'str';
            return [option, optionStore];
    }

    function extract_val(table,header=[]){
        let data = [];

        if(table.rows.length >=1){

            let row = table.rows;
            let l = row.length;
            if(header.length===0){
                let cell = row[0].cells;
                if(cell.length>=1){
                    let l = cell.length;
                    for(let i=0;i<l;i++){
                        if(cell[i].childElementCount !==0){
                            header.push(extract_from_td(cell[i])[0]);
                        }else{
                            header.push(cell[i].innerText);
                        }
                    }
                }
            }

            for(let i=1;i<l;i++){
                if(row[i].cells.length>=1){
                    let cell = row[i].cells;
                    let l = cell.length;
                    let trDict = {};
                    for(let j=0;j<l;j++){
                        if(cell[j].childElementCount !==0){
                            let extract = extract_from_td(cell[j])
                            trDict[header[j]] = extract;
                        }else{
                            trDict[header[j]] = cell[j].innerText;
                        }
                    }
                    data.push(trDict);
                }
            }
        }

        function extract_from_td(td){
            let l = td.childElementCount;
            let child = td.children;
            let td_data = [];
            for(let i=0;i<l;i++){
                if(child[i].childElementCount !==0){
                    let extract = extract_from_td(td);
                    if(Array.isArray(extract)){
                        td_data.concat(extract);
                    }else{
                        td_data.push(extract);
                    }
                }else{
                    let tag_name = child[i].tagName;
                    if(tag_name ==='INPUT' || tag_name==='TEXTAREA'||tag_name==='SELECT'){
                        td_data.push(child[i].value);
                    }else{
                        td_data.push(child[i].innerHTML);

                    }
                }
            }
            return td_data.length===1 ? td_data[0] : td_data;
        }
        return data;
    }



    function getTableTag(table_tag){
        let table='';
        if(typeof table_tag ==="string"){
            try{
                table_tag = document.getElementById(table_tag);
            }catch{
                table = document.getElementsByClassName(table_tag)[0];
            }
        }else{
            table = table_tag;
        }
        return table;
    }


})();






let extract_temp = {'type':'array object', 'td':{'<>':'input', value:['attribute','']}};






let header=['name','age'];
Example
let temp = {
    '<>':'tr',
    'html':[
            {
                '<>':'td',
                'html':[{'<>':'input', 'type':'text', 'value':'${name}'}]
            },
            {
                '<>':'td',
                'html': [{'<>':'input', 'type':'text', 'value':'${age}'}]
            }
        ],
    'wrap':{'<>': 'div','class':'wrap baby'}
    };


let d = [
    {'name':'Aryan','age':'19'},
    {'name':'sony','age':'100'},
    {'name':'Vishal','age':'99'},
    {'name':'Happy','age':'98'}
    ];


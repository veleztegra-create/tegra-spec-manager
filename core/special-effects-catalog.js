window.SpecialEffectsCatalog = (function () {
    'use strict';
    function normalizeInkType(inkType) {
        const value=String(inkType||'WATER').trim().toUpperCase();
        if(['BASE AGUA','WATER','WATER-BASE'].includes(value))return 'WATER';
        if(['SILICON','SILICONE'].includes(value))return 'SILICONE';
        return value;
    }
    function nextLetter(usedLetters = []) {
        const used = new Set(Array.from(usedLetters, letter => String(letter || '').trim().toUpperCase()));
        return 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('').find(letter => !used.has(letter)) || '';
    }

    function catalogInkKey(inkType) {
        const value=normalizeInkType(inkType);
        return value==='WATER'?'BASE AGUA':value==='SILICONE'?'SILICON':value;
    }
    function getOptions(catalog,inkType) {
        const root=catalog?.['EFECTOS ESPECIALES']||catalog||{};
        const source=root[catalogInkKey(inkType)]||{};
        return Object.entries(source).map(([category,products])=>{
            const items=[];
            if(normalizeInkType(inkType)==='SILICONE'&&category.toUpperCase()==='EFECTO DE BRILLO'){
                const pairs=new Map();
                (Array.isArray(products)?products:[]).forEach(product=>{
                    const match=String(product.producto||'').match(/^(.*) PART-([AB])$/i);if(!match)return;
                    const key=match[1].trim(),pair=pairs.get(key)||{};pair[match[2].toUpperCase()]=product;pairs.set(key,pair);
                });
                pairs.forEach((pair,formulation)=>{
                    if(!pair.A||!pair.B)return;
                    items.push({producto:'SHINY SILICONE',label:`SHINY SILICONE — ${formulation}`,category,formulation,components:[{producto:pair.A.producto,porcentaje:50},{producto:pair.B.producto,porcentaje:50}]});
                });
            }else (Array.isArray(products)?products:[]).forEach(product=>{if(product?.producto)items.push({producto:String(product.producto),label:String(product.producto),category,components:[]});});
            return {category,items};
        }).filter(group=>group.items.length);
    }
    function appendToSequence(baseSequence=[],effects=[],idFactory=()=>Date.now()+Math.random()){
        const sequence=Array.isArray(baseSequence)?baseSequence.map(step=>({...step})):[];
        const station=type=>({id:idFactory(),type,screenLetter:'',val:type,mesh:'-',additives:''});
        const lastType=()=>String(sequence[sequence.length-1]?.type||sequence[sequence.length-1]?.tipo||'').toUpperCase();
        const separator=()=>{if(!sequence.length||lastType()==='COOL')return;if(lastType()==='FLASH')sequence.push(station('COOL'));else sequence.push(station('FLASH'),station('COOL'));};
        (effects||[]).forEach(effect=>{
            separator();
            const common={type:'SPECIAL_EFFECT',specialEffectId:effect.id,screenLetter:effect.screenLetter||'',val:effect.val||effect.specialEffect?.producto||'SPECIAL EFFECT',mesh:effect.mesh||'',additives:effect.additives||'',specialEffect:effect.specialEffect?{...effect.specialEffect,components:Array.isArray(effect.specialEffect.components)?effect.specialEffect.components.map(component=>({...component})):[]}:null};
            sequence.push({...common,id:idFactory(),pass:1},station('FLASH'),station('COOL'),{...common,id:idFactory(),pass:2});
        });
        return sequence;
    }
    return {normalizeInkType,nextLetter,getOptions,appendToSequence};
})();

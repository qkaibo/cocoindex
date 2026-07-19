import{xa as j}from"./index-xVMbBAS-.js";import{n as q,t as J}from"./mermaid-parser.core-D0sPtDGl.js";import{Bt as r,H as B,Ht as D,L as tt,Vt as et,t as at,xt as it}from"./src-CqRKEjKz.js";import{U as rt,W as st,a as nt,c as ot,f as lt,j as ct,q as dt,v as pt,w as gt,x as ht,y as ut}from"./chunk-CSCIHK7Q-0dH-kyjP.js";import{n as ft,t as mt}from"./chunk-WU5MYG2G-ABWYEXhd.js";import{d as _t,i as xt,m as St}from"./chunk-5ZQYHXKU-gDhHgwVs.js";import{n as wt,t as Ct}from"./chunk-4BX2VUAB-K0rs5pwF.js";var y,g,l,h,F,$,L,R,z,I,Dt,yt=j((()=>{mt(),Ct(),_t(),ct(),et(),J(),at(),y=lt.pie,g={sections:new Map,showData:!1,config:y},l=g.sections,h=g.showData,F=structuredClone(y),$={getConfig:r(()=>structuredClone(F),"getConfig"),clear:r(()=>{l=new Map,h=g.showData,nt()},"clear"),setDiagramTitle:dt,getDiagramTitle:gt,setAccTitle:st,getAccTitle:ut,setAccDescription:rt,getAccDescription:pt,addSection:r(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);l.has(t)||(l.set(t,a),D.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),getSections:r(()=>l,"getSections"),setShowData:r(t=>{h=t},"setShowData"),getShowData:r(()=>h,"getShowData")},L=r((t,a)=>{wt(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),R={parse:r(async t=>{const a=await q("pie",t);D.debug(a),L(a,$)},"parse")},z=r(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),I=r(t=>{const a=[...t.values()].reduce((s,n)=>s+n,0),A=[...t.entries()].map(([s,n])=>({label:s,value:n})).filter(s=>s.value/a*100>=1);return tt().value(s=>s.value).sort(null)(A)},"createPieArcs"),Dt={parser:R,db:$,renderer:{draw:r((t,a,A,s)=>{D.debug(`rendering pie chart
`+t);const n=s.db,T=ht(),v=xt(n.getConfig(),T.pie),O=40,u=18,P=4,c=450,f=c,m=ft(a),o=m.append("g");o.attr("transform","translate(225,225)");const{themeVariables:i}=T;let[_]=St(i.pieOuterStrokeWidth);_??(_=2);const k=v.textPosition,d=Math.min(f,c)/2-O,U=B().innerRadius(0).outerRadius(d),H=B().innerRadius(d*k).outerRadius(d*k);o.append("circle").attr("cx",0).attr("cy",0).attr("r",d+_/2).attr("class","pieOuterCircle");const p=n.getSections(),N=I(p),V=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let x=0;p.forEach(e=>{x+=e});const b=N.filter(e=>(e.data.value/x*100).toFixed(0)!=="0"),S=it(V).domain([...p.keys()]);o.selectAll("mySlices").data(b).enter().append("path").attr("d",U).attr("fill",e=>S(e.data.label)).attr("class","pieCircle"),o.selectAll("mySlices").data(b).enter().append("text").text(e=>(e.data.value/x*100).toFixed(0)+"%").attr("transform",e=>"translate("+H.centroid(e)+")").style("text-anchor","middle").attr("class","slice");const X=o.append("text").text(n.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),E=[...p.entries()].map(([e,C])=>({label:e,value:C})),w=o.selectAll(".legend").data(E).enter().append("g").attr("class","legend").attr("transform",(e,C)=>{const Z=22*E.length/2;return"translate(216,"+(C*22-Z)+")"});w.append("rect").attr("width",u).attr("height",u).style("fill",e=>S(e.label)).style("stroke",e=>S(e.label)),w.append("text").attr("x",22).attr("y",u-P).text(e=>n.getShowData()?`${e.label} [${e.value}]`:e.label);const K=512+Math.max(...w.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0)),G=X.node()?.getBoundingClientRect().width??0,Q=f/2-G/2,Y=f/2+G/2,M=Math.min(0,Q),W=Math.max(K,Y)-M;m.attr("viewBox",`${M} 0 ${W} ${c}`),ot(m,c,W,v.useMaxWidth)},"draw")},styles:z}}));yt();export{Dt as diagram};

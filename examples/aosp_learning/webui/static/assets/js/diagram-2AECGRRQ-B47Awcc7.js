import{Ca as V}from"./index-DXLAPDfS.js";import{n as j,t as Q}from"./mermaid-parser.core-KgL_EZNx.js";import{Bt as l,Ht as X,Vt as Y}from"./src-C1yku_wW.js";import{D as K,U as Z,W as q,a as J,b,c as N,f as tt,j as et,q as at,v as rt,w as st,y as nt}from"./chunk-CSCIHK7Q-Dx2jjR8P.js";import{n as it,t as ot}from"./chunk-WU5MYG2G--bVXgu5e.js";import{d as lt,i as y}from"./chunk-5ZQYHXKU-ORE0WwyP.js";import{n as ct,t as dt}from"./chunk-4BX2VUAB-4WV6cAhW.js";function M(a,t,e,r,s,i,o){const n=t.length,c=Math.min(o.width,o.height)/2;e.forEach((u,d)=>{if(u.entries.length!==n)return;const m=u.entries.map((g,$)=>{const f=2*Math.PI*$/n-Math.PI/2,w=W(g,r,s,c);return{x:w*Math.cos(f),y:w*Math.sin(f)}});i==="circle"?a.append("path").attr("d",U(m,o.curveTension)).attr("class",`radarCurve-${d}`):i==="polygon"&&a.append("polygon").attr("points",m.map(g=>`${g.x},${g.y}`).join(" ")).attr("class",`radarCurve-${d}`)})}function W(a,t,e,r){return r*(Math.min(Math.max(a,t),e)-t)/(e-t)}function U(a,t){const e=a.length;let r=`M${a[0].x},${a[0].y}`;for(let s=0;s<e;s++){const i=a[(s-1+e)%e],o=a[s],n=a[(s+1)%e],c=a[(s+2)%e],u={x:o.x+(n.x-i.x)*t,y:o.y+(n.y-i.y)*t},d={x:n.x-(c.x-o.x)*t,y:n.y-(c.y-o.y)*t};r+=` C${u.x},${u.y} ${d.x},${d.y} ${n.x},${n.y}`}return`${r} Z`}function A(a,t,e,r){if(!e)return;const s=(r.width/2+r.marginRight)*3/4,i=-(r.height/2+r.marginTop)*3/4,o=20;t.forEach((n,c)=>{const u=a.append("g").attr("transform",`translate(${s}, ${i+c*o})`);u.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${c}`),u.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(n.label)})}var h,v,p,_,L,C,T,k,S,O,R,x,I,E,F,G,D,B,z,H,P,ut,pt=V((()=>{ot(),dt(),lt(),et(),Y(),Q(),h={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},v={axes:[],curves:[],options:h},p=structuredClone(v),_=tt.radar,L=l(()=>y({..._,...b().radar}),"getConfig"),C=l(()=>p.axes,"getAxes"),T=l(()=>p.curves,"getCurves"),k=l(()=>p.options,"getOptions"),S=l(a=>{p.axes=a.map(t=>({name:t.name,label:t.label??t.name}))},"setAxes"),O=l(a=>{p.curves=a.map(t=>({name:t.name,label:t.label??t.name,entries:R(t.entries)}))},"setCurves"),R=l(a=>{if(a[0].axis==null)return a.map(e=>e.value);const t=C();if(t.length===0)throw new Error("Axes must be populated before curves for reference entries");return t.map(e=>{const r=a.find(s=>s.axis?.$refText===e.name);if(r===void 0)throw new Error("Missing entry for axis "+e.label);return r.value})},"computeCurveEntries"),x={getAxes:C,getCurves:T,getOptions:k,setAxes:S,setCurves:O,setOptions:l(a=>{const t=a.reduce((e,r)=>(e[r.name]=r,e),{});p.options={showLegend:t.showLegend?.value??h.showLegend,ticks:t.ticks?.value??h.ticks,max:t.max?.value??h.max,min:t.min?.value??h.min,graticule:t.graticule?.value??h.graticule}},"setOptions"),getConfig:L,clear:l(()=>{J(),p=structuredClone(v)},"clear"),setAccTitle:q,getAccTitle:nt,setDiagramTitle:at,getDiagramTitle:st,getAccDescription:rt,setAccDescription:Z},I=l(a=>{ct(a,x);const{axes:t,curves:e,options:r}=a;x.setAxes(t),x.setCurves(e),x.setOptions(r)},"populate"),E={parse:l(async a=>{const t=await j("radar",a);X.debug(t),I(t)},"parse")},F=l((a,t,e,r)=>{const s=r.db,i=s.getAxes(),o=s.getCurves(),n=s.getOptions(),c=s.getConfig(),u=s.getDiagramTitle(),d=G(it(t),c),m=n.max??Math.max(...o.map(f=>Math.max(...f.entries))),g=n.min,$=Math.min(c.width,c.height)/2;D(d,i,$,n.ticks,n.graticule),B(d,i,$,c),M(d,i,o,g,m,n.graticule,c),A(d,o,n.showLegend,c),d.append("text").attr("class","radarTitle").text(u).attr("x",0).attr("y",-c.height/2-c.marginTop)},"draw"),G=l((a,t)=>{const e=t.width+t.marginLeft+t.marginRight,r=t.height+t.marginTop+t.marginBottom,s={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return N(a,r,e,t.useMaxWidth??!0),a.attr("viewBox",`0 0 ${e} ${r}`),a.append("g").attr("transform",`translate(${s.x}, ${s.y})`)},"drawFrame"),D=l((a,t,e,r,s)=>{if(s==="circle")for(let i=0;i<r;i++){const o=e*(i+1)/r;a.append("circle").attr("r",o).attr("class","radarGraticule")}else if(s==="polygon"){const i=t.length;for(let o=0;o<r;o++){const n=e*(o+1)/r,c=t.map((u,d)=>{const m=2*d*Math.PI/i-Math.PI/2;return`${n*Math.cos(m)},${n*Math.sin(m)}`}).join(" ");a.append("polygon").attr("points",c).attr("class","radarGraticule")}}},"drawGraticule"),B=l((a,t,e,r)=>{const s=t.length;for(let i=0;i<s;i++){const o=t[i].label,n=2*i*Math.PI/s-Math.PI/2;a.append("line").attr("x1",0).attr("y1",0).attr("x2",e*r.axisScaleFactor*Math.cos(n)).attr("y2",e*r.axisScaleFactor*Math.sin(n)).attr("class","radarAxisLine"),a.append("text").text(o).attr("x",e*r.axisLabelFactor*Math.cos(n)).attr("y",e*r.axisLabelFactor*Math.sin(n)).attr("class","radarAxisLabel")}},"drawAxes"),l(M,"drawCurves"),l(W,"relativeRadius"),l(U,"closedRoundCurve"),l(A,"drawLegend"),z={draw:F},H=l((a,t)=>{let e="";for(let r=0;r<a.THEME_COLOR_LIMIT;r++){const s=a[`cScale${r}`];e+=`
		.radarCurve-${r} {
			color: ${s};
			fill: ${s};
			fill-opacity: ${t.curveOpacity};
			stroke: ${s};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${r} {
			fill: ${s};
			fill-opacity: ${t.curveOpacity};
			stroke: ${s};
		}
		`}return e},"genIndexStyles"),P=l(a=>{const t=y(K(),b().themeVariables);return{themeVariables:t,radarOptions:y(t.radar,a)}},"buildRadarStyleOptions"),ut={parser:E,db:x,renderer:z,styles:l(({radar:a}={})=>{const{themeVariables:t,radarOptions:e}=P(a);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${e.axisColor};
		stroke-width: ${e.axisStrokeWidth};
	}
	.radarAxisLabel {
		dominant-baseline: middle;
		text-anchor: middle;
		font-size: ${e.axisLabelFontSize}px;
		color: ${e.axisColor};
	}
	.radarGraticule {
		fill: ${e.graticuleColor};
		fill-opacity: ${e.graticuleOpacity};
		stroke: ${e.graticuleColor};
		stroke-width: ${e.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${e.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${H(t,e)}
	`},"styles")}}));pt();export{ut as diagram};

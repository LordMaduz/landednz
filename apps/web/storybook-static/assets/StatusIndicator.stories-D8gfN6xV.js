import{R as e}from"./index-Bc2G9s8g.js";import{c as Q}from"./cn-DOIGBiOF.js";const T={sm:{container:"w-4 h-4",iconSize:8},md:{container:"w-6 h-6",iconSize:12}},X={not_started:"border-2 border-blocked bg-transparent",in_progress:"border-2 border-primary overflow-hidden relative",complete:"bg-success flex items-center justify-center",blocked:"bg-blocked flex items-center justify-center",premium_locked:"bg-secondary flex items-center justify-center",loading:"bg-blocked-light skeleton-pulse",error:"bg-error flex items-center justify-center"};function Y({size:t}){return e.createElement("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true"},e.createElement("polyline",{points:"4 13 9 18 20 7",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"}))}function g({size:t}){return e.createElement("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true"},e.createElement("rect",{x:"5",y:"11",width:"14",height:"10",rx:"2",fill:"white"}),e.createElement("path",{d:"M8 11V7a4 4 0 0 1 8 0v4",stroke:"white",strokeWidth:"2",strokeLinecap:"round",fill:"none"}))}function Z({size:t}){return e.createElement("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none","aria-hidden":"true"},e.createElement("line",{x1:"12",y1:"7",x2:"12",y2:"14",stroke:"white",strokeWidth:"2.5",strokeLinecap:"round"}),e.createElement("circle",{cx:"12",cy:"18",r:"1.5",fill:"white"}))}function a({state:t,size:H="md",className:J}){const{container:K,iconSize:s}=T[H];return e.createElement("div",{role:"img","aria-label":t.replace(/_/g," "),className:Q("rounded-full shrink-0",X[t],K,J)},t==="in_progress"&&e.createElement("div",{className:"absolute inset-0 flex"},e.createElement("div",{className:"w-1/2 h-full bg-primary"})),t==="complete"&&e.createElement(Y,{size:s}),t==="blocked"&&e.createElement(g,{size:s}),t==="premium_locked"&&e.createElement(g,{size:s}),t==="error"&&e.createElement(Z,{size:s}))}try{a.displayName="StatusIndicator",a.__docgenInfo={description:"",displayName:"StatusIndicator",props:{state:{defaultValue:null,description:"",name:"state",required:!0,type:{name:"enum",value:[{value:'"error"'},{value:'"not_started"'},{value:'"in_progress"'},{value:'"complete"'},{value:'"blocked"'},{value:'"premium_locked"'},{value:'"loading"'}]}},size:{defaultValue:{value:"md"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'}]}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const te={title:"UI/StatusIndicator",component:a,parameters:{layout:"padded"}},r={args:{state:"not_started",size:"md"}},c={args:{state:"in_progress",size:"md"}},n={args:{state:"complete",size:"md"}},l={args:{state:"blocked",size:"md"}},o={args:{state:"premium_locked",size:"md"}},i={args:{state:"loading",size:"md"}},m={args:{state:"error",size:"md"}},d={render:()=>e.createElement("div",{className:"grid grid-cols-7 gap-4 p-4"},e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"not_started"}),e.createElement("p",{className:"text-caption text-center"},"not_started")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"in_progress"}),e.createElement("p",{className:"text-caption text-center"},"in_progress")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"complete"}),e.createElement("p",{className:"text-caption text-center"},"complete")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"blocked"}),e.createElement("p",{className:"text-caption text-center"},"blocked")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"premium_locked"}),e.createElement("p",{className:"text-caption text-center"},"premium_locked")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"loading"}),e.createElement("p",{className:"text-caption text-center"},"loading")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"error"}),e.createElement("p",{className:"text-caption text-center"},"error")))},p={render:()=>e.createElement("div",{className:"grid grid-cols-7 gap-4 p-4"},e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"not_started",size:"sm"}),e.createElement("p",{className:"text-caption text-center"},"not_started")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"in_progress",size:"sm"}),e.createElement("p",{className:"text-caption text-center"},"in_progress")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"complete",size:"sm"}),e.createElement("p",{className:"text-caption text-center"},"complete")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"blocked",size:"sm"}),e.createElement("p",{className:"text-caption text-center"},"blocked")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"premium_locked",size:"sm"}),e.createElement("p",{className:"text-caption text-center"},"premium_locked")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"loading",size:"sm"}),e.createElement("p",{className:"text-caption text-center"},"loading")),e.createElement("div",{className:"flex flex-col items-center gap-2"},e.createElement(a,{state:"error",size:"sm"}),e.createElement("p",{className:"text-caption text-center"},"error")))},x={render:()=>e.createElement("div",{className:"flex flex-col gap-6 p-4"},["not_started","in_progress","complete","blocked","premium_locked","loading","error"].map(t=>e.createElement("div",{key:t,className:"flex items-center gap-4"},e.createElement("div",{className:"w-24 text-caption"},t.replace(/_/g," ")),e.createElement("div",{className:"flex items-center gap-3"},e.createElement("div",{className:"flex flex-col items-center gap-1"},e.createElement(a,{state:t,size:"sm"}),e.createElement("span",{className:"text-caption"},"sm")),e.createElement("div",{className:"flex flex-col items-center gap-1"},e.createElement(a,{state:t,size:"md"}),e.createElement("span",{className:"text-caption"},"md"))))))};var u,f,v;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    state: 'not_started',
    size: 'md'
  }
}`,...(v=(f=r.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var N,E,_;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    state: 'in_progress',
    size: 'md'
  }
}`,...(_=(E=c.parameters)==null?void 0:E.docs)==null?void 0:_.source}}};var k,S,z;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    state: 'complete',
    size: 'md'
  }
}`,...(z=(S=n.parameters)==null?void 0:S.docs)==null?void 0:z.source}}};var h,b,I;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    state: 'blocked',
    size: 'md'
  }
}`,...(I=(b=l.parameters)==null?void 0:b.docs)==null?void 0:I.source}}};var y,w,L;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    state: 'premium_locked',
    size: 'md'
  }
}`,...(L=(w=o.parameters)==null?void 0:w.docs)==null?void 0:L.source}}};var j,B,A;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    state: 'loading',
    size: 'md'
  }
}`,...(A=(B=i.parameters)==null?void 0:B.docs)==null?void 0:A.source}}};var C,P,V;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    state: 'error',
    size: 'md'
  }
}`,...(V=(P=m.parameters)==null?void 0:P.docs)==null?void 0:V.source}}};var q,W,R;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <div className="grid grid-cols-7 gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="not_started" />
        <p className="text-caption text-center">not_started</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="in_progress" />
        <p className="text-caption text-center">in_progress</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="complete" />
        <p className="text-caption text-center">complete</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="blocked" />
        <p className="text-caption text-center">blocked</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="premium_locked" />
        <p className="text-caption text-center">premium_locked</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="loading" />
        <p className="text-caption text-center">loading</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="error" />
        <p className="text-caption text-center">error</p>
      </div>
    </div>
}`,...(R=(W=d.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};var M,O,U;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="grid grid-cols-7 gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="not_started" size="sm" />
        <p className="text-caption text-center">not_started</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="in_progress" size="sm" />
        <p className="text-caption text-center">in_progress</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="complete" size="sm" />
        <p className="text-caption text-center">complete</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="blocked" size="sm" />
        <p className="text-caption text-center">blocked</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="premium_locked" size="sm" />
        <p className="text-caption text-center">premium_locked</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="loading" size="sm" />
        <p className="text-caption text-center">loading</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="error" size="sm" />
        <p className="text-caption text-center">error</p>
      </div>
    </div>
}`,...(U=(O=p.parameters)==null?void 0:O.docs)==null?void 0:U.source}}};var D,F,G;x.parameters={...x.parameters,docs:{...(D=x.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-6 p-4">
      {(['not_started', 'in_progress', 'complete', 'blocked', 'premium_locked', 'loading', 'error'] as const).map(state => <div key={state} className="flex items-center gap-4">
          <div className="w-24 text-caption">{state.replace(/_/g, ' ')}</div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <StatusIndicator state={state} size="sm" />
              <span className="text-caption">sm</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StatusIndicator state={state} size="md" />
              <span className="text-caption">md</span>
            </div>
          </div>
        </div>)}
    </div>
}`,...(G=(F=x.parameters)==null?void 0:F.docs)==null?void 0:G.source}}};const ae=["NotStarted","InProgress","Complete","Blocked","PremiumLocked","Loading","Error","AllStates","SmallSize","AllSizes"];export{x as AllSizes,d as AllStates,l as Blocked,n as Complete,m as Error,c as InProgress,i as Loading,r as NotStarted,o as PremiumLocked,p as SmallSize,ae as __namedExportsOrder,te as default};

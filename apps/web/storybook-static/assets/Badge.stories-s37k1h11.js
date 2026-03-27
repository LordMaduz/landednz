import{R as e}from"./index-Bc2G9s8g.js";import{c as H}from"./cn-DOIGBiOF.js";const V={phase:"bg-primary-light text-primary","difficulty-easy":"bg-success-light text-success","difficulty-medium":"bg-warning-light text-warning","difficulty-hard":"bg-error-light text-error",premium:"bg-secondary-light text-secondary-hover"};function a({variant:d,children:b,className:D}){const m=d==="premium";return e.createElement("span",{className:H("inline-flex items-center gap-1 rounded-badge text-caption font-medium",m?"px-2 py-0.5":"px-3 py-1",V[d],D)},m&&e.createElement("svg",{width:"10",height:"10",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},e.createElement("rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2"}),e.createElement("path",{d:"M7 11V7a5 5 0 0 1 10 0v4"})),b)}try{a.displayName="Badge",a.__docgenInfo={description:"",displayName:"Badge",props:{variant:{defaultValue:null,description:"",name:"variant",required:!0,type:{name:"enum",value:[{value:'"phase"'},{value:'"difficulty-easy"'},{value:'"difficulty-medium"'},{value:'"difficulty-hard"'},{value:'"premium"'}]}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const A={title:"UI/Badge",component:a,parameters:{layout:"centered"}},r={args:{variant:"phase",children:"Phase 1"}},i={args:{variant:"difficulty-easy",children:"Easy"}},t={args:{variant:"difficulty-medium",children:"Medium"}},s={args:{variant:"difficulty-hard",children:"Hard"}},n={args:{variant:"premium",children:"Premium"}},c={render:()=>e.createElement("div",{className:"flex flex-wrap gap-3 p-4"},e.createElement(a,{variant:"phase"},"Phase 1"),e.createElement(a,{variant:"difficulty-easy"},"Easy"),e.createElement(a,{variant:"difficulty-medium"},"Medium"),e.createElement(a,{variant:"difficulty-hard"},"Hard"),e.createElement(a,{variant:"premium"},"Premium"))};var u,l,o;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: 'phase',
    children: 'Phase 1'
  }
}`,...(o=(l=r.parameters)==null?void 0:l.docs)==null?void 0:o.source}}};var p,f,g;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: 'difficulty-easy',
    children: 'Easy'
  }
}`,...(g=(f=i.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var y,h,v;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    variant: 'difficulty-medium',
    children: 'Medium'
  }
}`,...(v=(h=t.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var x,E,B;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: 'difficulty-hard',
    children: 'Hard'
  }
}`,...(B=(E=s.parameters)==null?void 0:E.docs)==null?void 0:B.source}}};var P,_,w;n.parameters={...n.parameters,docs:{...(P=n.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    variant: 'premium',
    children: 'Premium'
  }
}`,...(w=(_=n.parameters)==null?void 0:_.docs)==null?void 0:w.source}}};var M,N,S;c.parameters={...c.parameters,docs:{...(M=c.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-3 p-4">
      <Badge variant="phase">Phase 1</Badge>
      <Badge variant="difficulty-easy">Easy</Badge>
      <Badge variant="difficulty-medium">Medium</Badge>
      <Badge variant="difficulty-hard">Hard</Badge>
      <Badge variant="premium">Premium</Badge>
    </div>
}`,...(S=(N=c.parameters)==null?void 0:N.docs)==null?void 0:S.source}}};const I=["Phase","DifficultyEasy","DifficultyMedium","DifficultyHard","Premium","AllVariants"];export{c as AllVariants,i as DifficultyEasy,s as DifficultyHard,t as DifficultyMedium,r as Phase,n as Premium,I as __namedExportsOrder,A as default};

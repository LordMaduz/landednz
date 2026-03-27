import{R as e}from"./index-Bc2G9s8g.js";import{c as d}from"./cn-DOIGBiOF.js";const L={sm:"h-1",md:"h-2"};function a({value:i=0,indeterminate:m=!1,size:M="sm",label:V="Progress",className:q}){const c=Math.max(0,Math.min(100,i));return e.createElement("div",{role:"progressbar","aria-label":V,"aria-valuenow":m?void 0:c,"aria-valuemin":0,"aria-valuemax":100,className:d("relative w-full bg-border rounded-full overflow-hidden",L[M],q)},e.createElement("div",{"aria-hidden":"true",className:d("h-full bg-primary rounded-full transition-all duration-fill",m&&"progress-pulse"),style:{width:m?"60%":`${c}%`}}))}try{a.displayName="ProgressBar",a.__docgenInfo={description:"",displayName:"ProgressBar",props:{value:{defaultValue:{value:"0"},description:"",name:"value",required:!1,type:{name:"number"}},indeterminate:{defaultValue:{value:"false"},description:"",name:"indeterminate",required:!1,type:{name:"boolean"}},size:{defaultValue:{value:"sm"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'}]}},label:{defaultValue:{value:"Progress"},description:"",name:"label",required:!1,type:{name:"string"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}}}}}catch{}const F={title:"UI/ProgressBar",component:a,parameters:{layout:"padded"}},r={args:{value:50,size:"sm",label:"Loading progress"}},s={args:{value:0,label:"No progress"}},l={args:{value:100,label:"Complete"}},n={args:{indeterminate:!0,label:"Loading..."}},t={render:()=>e.createElement("div",{className:"flex flex-col gap-4 p-4 w-80"},e.createElement("div",null,e.createElement("p",{className:"text-secondary mb-2"},"Small (4px)"),e.createElement(a,{value:65,size:"sm",label:"Small progress bar"})),e.createElement("div",null,e.createElement("p",{className:"text-secondary mb-2"},"Medium (8px)"),e.createElement(a,{value:65,size:"md",label:"Medium progress bar"})))},o={args:{value:40,size:"sm",label:"Interactive progress"},argTypes:{value:{control:{type:"range",min:0,max:100,step:1}},size:{control:{type:"select",options:["sm","md"]}},indeterminate:{control:"boolean"}}};var p,u,g;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    value: 50,
    size: 'sm',
    label: 'Loading progress'
  }
}`,...(g=(u=r.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var v,b,f;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'No progress'
  }
}`,...(f=(b=s.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var y,x,z;l.parameters={...l.parameters,docs:{...(y=l.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Complete'
  }
}`,...(z=(x=l.parameters)==null?void 0:x.docs)==null?void 0:z.source}}};var N,S,E;n.parameters={...n.parameters,docs:{...(N=n.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    indeterminate: true,
    label: 'Loading...'
  }
}`,...(E=(S=n.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};var _,h,I;t.parameters={...t.parameters,docs:{...(_=t.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 p-4 w-80">
      <div>
        <p className="text-secondary mb-2">Small (4px)</p>
        <ProgressBar value={65} size="sm" label="Small progress bar" />
      </div>
      <div>
        <p className="text-secondary mb-2">Medium (8px)</p>
        <ProgressBar value={65} size="md" label="Medium progress bar" />
      </div>
    </div>
}`,...(I=(h=t.parameters)==null?void 0:h.docs)==null?void 0:I.source}}};var P,w,B;o.parameters={...o.parameters,docs:{...(P=o.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    value: 40,
    size: 'sm',
    label: 'Interactive progress'
  },
  argTypes: {
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
        step: 1
      }
    },
    size: {
      control: {
        type: 'select',
        options: ['sm', 'md']
      }
    },
    indeterminate: {
      control: 'boolean'
    }
  }
}`,...(B=(w=o.parameters)==null?void 0:w.docs)==null?void 0:B.source}}};const R=["Default","Empty","Full","Indeterminate","Sizes","Interactive"];export{r as Default,s as Empty,l as Full,n as Indeterminate,o as Interactive,t as Sizes,R as __namedExportsOrder,F as default};

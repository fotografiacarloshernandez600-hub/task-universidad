/// <reference types="vite/client" />
declare module '*.wasm?url' { const url: string; export default url; }
interface CordovaResultSet { rows: {length:number; item:(index:number)=>Record<string,unknown>} }
interface CordovaDb {
  transaction(callback:(tx:{executeSql:(sql:string,args:unknown[],success?:(tx:unknown,result:CordovaResultSet)=>void,error?:(tx:unknown,err:{message:string})=>void)=>void})=>void,error?:(err:{message:string})=>void,success?:()=>void):void;
}
interface Window { sqlitePlugin?:{openDatabase:(options:{name:string;location:string},success:(db:CordovaDb)=>void,error:(err:{message:string})=>void)=>void}; cordova?:object; }

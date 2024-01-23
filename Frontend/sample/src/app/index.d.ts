declare module 'starseeker-frontend' {
    //export default function ({ pointEntities, surfaceEntities, fiware }): React.VFC<{ pointEntities: any[], surfaceEntities: any[], fiware: any[] }>
    const StarseekerFrontend: React.VFC<{ pointEntities: any[]; surfaceEntities: any[]; fiware: any[]; pinData: any[]}>;

    export default StarseekerFrontend;
}

export {};

declare global {
  interface Window {
    readonly google?: {
      readonly accounts: {
        readonly id: {
          initialize: (config: {
            readonly client_id: string;
            readonly callback: (response: { readonly credential: string }) => void;
            readonly auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | boolean | number>,
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

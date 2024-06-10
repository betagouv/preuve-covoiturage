{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in
        {
          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              # system packages
              p7zip
              just
              openssl

              # rpc infra
              nodejs_20
              postgresql_14
              deno

              # data stack
              dbt
              pre-commit
              python311Packages.dbt-postgres
            ];
            shellHook = ''
              export PATH="$PWD/node_modules/.bin/:$PATH"
              export PRE_COMMIT_ALLOW_NO_CONFIG=1
            '';
          };
        });
}

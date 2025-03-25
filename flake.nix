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
              jq
              minio-client

              # rpc infra
              nodejs_20
              postgresql_14
              deno

              # data stack
              dbt
              pre-commit
              python312Packages.dbt-postgres
              uv

              # misc
              gh
            ];
            shellHook = ''
              export PATH="$PWD/node_modules/.bin/:$PATH"
              export PRE_COMMIT_ALLOW_NO_CONFIG=1
              export GH_REPO=betagouv/preuve-covoiturage
              export DENO_NO_UPDATE_CHECK=true
              export SEVEN_ZIP_BIN_PATH=$(which 7z)
              export LESS="-SRXF"
            '';
          };
        });
}

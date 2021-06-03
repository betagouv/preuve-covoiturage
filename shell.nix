with import <nixpkgs> {};
let
  unstable = import <nixos-unstable> {};
in
stdenv.mkDerivation {
    name = "node";
    buildInputs = [
        (yarn.override { nodejs = null; })
        nodejs-14_x
        act
        openssl
        unstable.cypress
    ];

    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
        export CYPRESS_RUN_BINARY=$(which Cypress)
    '';
}
with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "node";
    buildInputs = [
        (yarn.override { nodejs = null; })
        nodejs-14_x
        act
    ];

    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
    '';
}
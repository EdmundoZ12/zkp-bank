// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x0bfc6affe7ec51668ea7aea90791a9ebbfe75addac9d98255c0953e41cc485c5), uint256(0x118133f595351abf48d8d33320efbb4bc68742f96f319bc42e2753a3fd98bd41));
        vk.beta = Pairing.G2Point([uint256(0x1dff0b7b649188ebe7c26cb91704affc35695b4199f0eef20da6a7355588f569), uint256(0x2f5533d2e8f17d77afbd953c8d462a328bd71c006935fb5ec31c903d3fd6aec7)], [uint256(0x0c9960bc43cd6009b8f4fd06f4032be25c18a334e83d3a8615ef84e9726a79c0), uint256(0x18efdc3b7c27eef61e6e9f0c5276c7732be13d2ed11863f0175154beb993b177)]);
        vk.gamma = Pairing.G2Point([uint256(0x0e729aeba3f6e89764becb2c61d52b27798df8c58216b8ed6ae6066c5a493696), uint256(0x12038900c53f2fb306a5ed0bdf2244505968e474e1413c3d48707fcd4b95af35)], [uint256(0x014ab54e3a1e71bc8fe5da8c03d0f9dd6decc6faafbb89ef4f7310df9a2275aa), uint256(0x2c909413ac103b77bc181f0d7578840db76248d95ac6def1be947ca46b91fb9f)]);
        vk.delta = Pairing.G2Point([uint256(0x2458e665ffc4e331900facab82e91972be5be520e1a91f8b5830a88e151d5c71), uint256(0x192b2e2909098347b42de15d27cbd2702f7fb4983353d825e342e50ee83a889b)], [uint256(0x08889893c154e388afb37b39a9d87c9b1c238d85a8fc7a6c3ba8e1d4d9054980), uint256(0x033974cd431d6f41f712c941500aef03c65f92db12cedfc9ac49e4a1bb00ab26)]);
        vk.gamma_abc = new Pairing.G1Point[](26);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x1e4ba344ef0f6ea1dc8d71b1735b7d2a10c35d41e57c3bb18c7f825ed5c91dc8), uint256(0x01acc5bf3b835f132d2f169ce7af8dfa641a7d0f8e1d7fc32efbadc6ba749d77));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x1bcad0bb65c92c321af851eeae0a3c977ae7a8f2aa6f7507a938881ba9782e55), uint256(0x03ea928482bc5b9596e7f20e54d236e3e74f503a685f048c52d0a706c45455ef));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x04afd69719b2cec98ed2018ffb46ffec1523ec920e1a519c044d270d316eff02), uint256(0x2ad49e2981e53cce476e4ae78d3daa6391cd80cddff37e9eab983eb1b6719970));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x03fdadbe0fa6e536d92b0489e3da1fdbba30c4796a021b2f1bb209146e75164e), uint256(0x21fb387ac435d8e772233ea9af775044e7d049c19996ec1d925be7c823075572));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x23e1c1b6d85061aab1d1526d28294b0c00af11c9c93b39c67158f66f4a96a383), uint256(0x1e13b432817f8236308d5617b4fdede51332112437886def314c307d0c694310));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x2ce4e78c3db87a7fb0a5bf22bd28972213d246afe29966947540219be39bc484), uint256(0x1adc0dcc1ed9e3115eae35114775d6625c68d0799ad0a852855eeb47d5e84930));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x1542e91b2fcf532d55d10636424c4c7b16a9dc9223eef758317af815e5ba392a), uint256(0x2fac6d6ff3f0da7de59f2a754d9555be868bd78a9369c636555bec42eab33343));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x134b5ef619ba0110937922dc916ab12a7dc413954717b9167b46d6d2a31db741), uint256(0x1a793fc07a1c1aaee68544f380e8f9f72bca6af15cd7b42e73b162c5c08cbc75));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x0b563296623b5b53d25cbccb0171d6488b565b50fe813e7074c4d7c797edcc24), uint256(0x2a84e9ee8710112a17a0a7ae41f158948769115067d326a510cad652478953f4));
        vk.gamma_abc[9] = Pairing.G1Point(uint256(0x06514d396ae1be8d319b5e4c6be4c5e904824257361fafb2e086f6f268edd8be), uint256(0x01919a64d18a1960da710abdc350c9a43f12f46d9f631b999186ed0d6566900f));
        vk.gamma_abc[10] = Pairing.G1Point(uint256(0x0ff512c38f53a250adfd227d2fac52b554e441861d564bb5b0634691c5a4f6bf), uint256(0x246895e5b4315da2c990303b2ff263319fc0825b07d1b1ef95b72c98a43f270f));
        vk.gamma_abc[11] = Pairing.G1Point(uint256(0x0c06a57cfc31253cca560cadf2f7bda6a90dce192737a07eca5c3d1b00f01480), uint256(0x0022dbae1595ada9e2f0ff6f04791e16c1cfe63a3a9ffe6ec8faecb1f8165d0c));
        vk.gamma_abc[12] = Pairing.G1Point(uint256(0x17c2bfaecee2bfda2a930d8b03378f8483213458c75561442170b05478620c47), uint256(0x11eb64c268cfd7109f1852885b2b07ac20d0b586b8dadca98444299fb329db29));
        vk.gamma_abc[13] = Pairing.G1Point(uint256(0x1f8d8609e76ce2f83725960f88b012a7aa01c2c24d6d4d894c532da30cbd8001), uint256(0x2ed39a2320e9a9e7d37014168994c0aaa6ce12911e61c35f2f0c33fc7174394d));
        vk.gamma_abc[14] = Pairing.G1Point(uint256(0x22fd6c2eb2d3d7795ede1c7bb9874e31b75264f3843de6b23c92992330648a6c), uint256(0x01b95039cd62f7cdd3e30639638b8b0085c4712d5e6051eb350f1f985d638d67));
        vk.gamma_abc[15] = Pairing.G1Point(uint256(0x017452f8e98837b213aded9ac4ee7d407a1320823bd8a74a14a63c3ace65f703), uint256(0x0b2fd05baa94a7a260b9aedc2fc287ae9e1cd5d9bdf3f996100d9b7a182ffb8f));
        vk.gamma_abc[16] = Pairing.G1Point(uint256(0x0739286488f103069bb0f8f059bf7792c07ccb81afebddac51f9e28276394f88), uint256(0x20cbb7bffb5038531428477cf20187c8f4384f0dd44ade8df1b6968f3787bb17));
        vk.gamma_abc[17] = Pairing.G1Point(uint256(0x099026a65ac0dd2afc27096c0bf5effafe2ae57ef01e7eb5c5995bede327c6ff), uint256(0x18ea72defbd9dceee102e9712f111dd62a0160596f2fe8db395d6e29785a0c8f));
        vk.gamma_abc[18] = Pairing.G1Point(uint256(0x3046acd80cb2eb63943e2a47ba30f6b75b7f66c427fa6318f78f09bd8b76739b), uint256(0x03bc45d5f3b49e78a39161cb76336d9e6971182d971850b1801f8258ea62b208));
        vk.gamma_abc[19] = Pairing.G1Point(uint256(0x0e9a346fee432cba723750ac2c0d2a2d1e2aac5d46dc5350d78032d35f8de6b9), uint256(0x09fa86233cd35e4027d4569c3fb17e0ddc0e516bdf221e2691f32bf54d0d3a19));
        vk.gamma_abc[20] = Pairing.G1Point(uint256(0x0fc0d0b95a5729e633f231dbd4741c89844640cd500b3fb96942ef47404f6724), uint256(0x2e07e260096db9f27164de8033445e9c6b8fe8a2632b03702cc9b10b095b72ec));
        vk.gamma_abc[21] = Pairing.G1Point(uint256(0x00f6b6f0eae50d65317b24d519848a2d9e975d9599dc19045b32daef12d3e6a5), uint256(0x0ccb28ae602a8bd666a40af2666487f47c2b9672da5501706ac26a21d9db3c50));
        vk.gamma_abc[22] = Pairing.G1Point(uint256(0x08f0538d2099d0fe6a4386649359815cebc4b088ddbde4563e28feaffb5f73e6), uint256(0x27ea56e3f0a35cd83f8874f2b59b3eec4e71aa20c9351f6f6f1271dc8b88db23));
        vk.gamma_abc[23] = Pairing.G1Point(uint256(0x27299cebf06c170c0fdd2702d0e8d25f80279705bd07d47c133248012a207ba5), uint256(0x04b37a1c34cbd76b93849833a967f782f2282f93c81dd61a76fddcf6771fe4fd));
        vk.gamma_abc[24] = Pairing.G1Point(uint256(0x1e6223a9e09e4969eba925fe31f15fa178e44446d7560bde540e8bb8ffd91ed9), uint256(0x0aa7b8c4afe0d53d991180ac0e6432470dbe37bc39071a31a79490565d009f63));
        vk.gamma_abc[25] = Pairing.G1Point(uint256(0x0882520b2bb2f7aaf86c145439d08b75b528be1e8a605ee848ed9341cf1f5b03), uint256(0x060ac8606d6f7f960d230af3f8afacd9227bd8cb82afbb7df255605f91f7d48f));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[25] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](25);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}

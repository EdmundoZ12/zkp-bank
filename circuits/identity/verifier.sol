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
        vk.alpha = Pairing.G1Point(uint256(0x2d98c6b63841234d1d274aa49137b98aa61042b736e0715ddd558ad37322fcfc), uint256(0x091beb2004490ce2e3ada7f35af3067ba03434994946847822071a0f9fb4ee9b));
        vk.beta = Pairing.G2Point([uint256(0x1d7cfa189f88178be65b4eadaa63ad8fc0e602d63a0b4d3d023fd03df90d5549), uint256(0x235c4fc438c200c6d2801e25482fd27aec4ca959611c9a06ce1175208accc954)], [uint256(0x223aa714963af1f7790aa71f6c2f4fff06e56472e1b4bab186c2e9ec46189f75), uint256(0x186ec2876ffa5c2d4d25031a814011741ce085e549e589c5f965f8b78fe19d6d)]);
        vk.gamma = Pairing.G2Point([uint256(0x1e1a65e8bca3df22e273277dd8e2ab7fb723ca9cf78d8415a6ed9cb4acaa1494), uint256(0x1b7c693d86f47d3c1744a9a496f63dfbf41232c972ef310b44f75e8ac0ec06c5)], [uint256(0x0c9479ff644da7e7ab6774611f21fb7f463657ea8f1d147845213ddca1835af8), uint256(0x301f7402730d9c3e41f3dc45e9274697aac24b1e64b37acacc227f83a6b81e78)]);
        vk.delta = Pairing.G2Point([uint256(0x12fea8861caa33730c8850f1b68115c6cbaa1e80b9a609249207adc3019cc1b3), uint256(0x2b8c8b0f30aa8846c99367e63b4445c7869808eab20f04bf4ee72b4464723260)], [uint256(0x28a9833859acb1e8e0782d781099838cbd4d31d0ab793ff5e701bd2b43b16bd8), uint256(0x20a456db24c2a41d789706006c1d046c1903fce7e7f3751a7fd9d68d3573fe1d)]);
        vk.gamma_abc = new Pairing.G1Point[](50);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x1a10fa76943eb64b9c6d0379b254cc03b951ca203ffe38ea829a0d92283f0624), uint256(0x267a5fb7c20afd208f4327cc9dccc18ee349a594550537b145a626e24bf7ee6e));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x2153ae3f961d858b456cc7cf773e2a45f9397ae9aafd03ca93d35253846192c3), uint256(0x1d123c76680023464df417c313ac89151a16486ac9c1c74159da6c93863f6163));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x1808c8445ee4dbe340149d8105287a3d9574e1363cb4de760e8c50d639805c7a), uint256(0x1f5d822eea3eb6069d204b6f6142d0ff04fa905e3fccd50c3ae67276bfaee547));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x28b8aafb5ab138adbe77c7c26aea32f75eb849fc6d4396941997d10fd1addb8b), uint256(0x2ce88210172144282d11bf037001e4d4ccdd23b6ede82583a1dd23cafc21afd8));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x01a7d8e995106f1935a946473c65c94558374922accc9a2aeff7638345e75b76), uint256(0x05a87b0545dfa9c3f2a587a5fb5e3d4fcfd93c43be175218fa6841ab9d286057));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x26654f357a62cb158d231d5116f6208b4d590811629fefcbf7472e6b3e84aad9), uint256(0x0bbecac13c51f3952163f3a9ae62b3e9aad5948aa152447b6118180a701f4b13));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x048adc37507b4c4abc2d2f9a7ccb9703b4992548f8ac9808c1d754c3c6816f72), uint256(0x1698f782b5517bb71af59a2592c19e80ba3c6957a81d4e842d5aaf6cb16eb059));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x2bd5a99b30d9cd540379f1108cf372bb42adccd57f0b4f28345127890e0f8932), uint256(0x226e22da80d21f1d64775f4441662ddbdf3c6b255e90395fdcb97307b45af31a));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x127687d195eb899cd285abec2090b629c3153ed7e21d7f87d4064f67a0482f27), uint256(0x11a2b9e2ecd52d00ac6845627a0a583ec5056125a608beba9ab051e5429bdada));
        vk.gamma_abc[9] = Pairing.G1Point(uint256(0x1da18d66f78c4fb4e3747f1e070e319448fe0e641d3404e996c57dffcf940ed1), uint256(0x1683442aaa67f79595e0469f85ddfe5bfea4a48242444b8a72e85c0b91b0e678));
        vk.gamma_abc[10] = Pairing.G1Point(uint256(0x0226e1b508e8a18ba1e429cbc3340b128db3483f4ec566517408dfe2360fd43f), uint256(0x279faf074d10fcba1dfa259069c6372d4fe3f4df48e918fd5ffc1a45b081aa79));
        vk.gamma_abc[11] = Pairing.G1Point(uint256(0x094535d991fc1c9090cd2547cfe810efe5e238f9e91d949665ad9d8d1f206d79), uint256(0x17e9ea113d53010825dd969ff5226d26eeb1a306ac266cb3bbd16688776ff99b));
        vk.gamma_abc[12] = Pairing.G1Point(uint256(0x0f461fad551374e1eb98450a58055b926f23b5c65002709df1b789f61d12e088), uint256(0x16c5448312cf0319db0e0e4003c763730b1c4e9743be8bedf210c29ad6df2a2f));
        vk.gamma_abc[13] = Pairing.G1Point(uint256(0x10624947b85a728767c2c1369c210a6da2d3496b178ae5712a56788ea2cff4bf), uint256(0x2d12e9069bf298e7e2fdf84dd2cd076ae601043b539d2d27932a3fbe18546112));
        vk.gamma_abc[14] = Pairing.G1Point(uint256(0x1d4f4f9c9ab9222dc4e352983a3cc1ee3a701b5698d7f04759ac6109b4f7ed8f), uint256(0x13e3d8027277a57cc5c5e9484253fb59f311a0a53fa58ab0c98e917ecf4820f5));
        vk.gamma_abc[15] = Pairing.G1Point(uint256(0x26fb7c06ffa7f8103a388256216deafb407465b2532cd84d48744860206599a9), uint256(0x0668bb99a08ae5d5d21c9fb4ea7d74d0ca3a42f37b88852040393a2f01c30bcc));
        vk.gamma_abc[16] = Pairing.G1Point(uint256(0x2b69e89bd3b03f7fe3a238b7976fb2a84a3d74fa698127cb71e07e553c1fe5f0), uint256(0x2b0d3b39c555e601fa26bd983a22a405a14697af3b5219438d493d6eedbf83b6));
        vk.gamma_abc[17] = Pairing.G1Point(uint256(0x2bcdf0591a150c27fe7d30d161c72924935ec1dc9e37dd33fb0c50d63215c918), uint256(0x18bdf42c01c523f98ddac6a04269b7d35b2d73ba139d313f09396d28cd0ccb6d));
        vk.gamma_abc[18] = Pairing.G1Point(uint256(0x281d6ee8199978501bb2ca6f9a548866a2d1166a3404df6a7bd489e7cd330bfd), uint256(0x190158f8f7f548543585ab15fe8bb6ae288555c3bd49a97c9e71579fa6be6f5d));
        vk.gamma_abc[19] = Pairing.G1Point(uint256(0x0c0c7ed22d02d08f078795908bd33d5a5de1c60167354cd6dcf4ee71bfda0343), uint256(0x2fa59ca10ee9b22498c8e514f613d1dce606a5fe0a74a8f0c1b44fc7d0e2bd1a));
        vk.gamma_abc[20] = Pairing.G1Point(uint256(0x0cbc269679b17083ddd4adbee0ebd587cf60a13fa8275d3cae1d2afa506fc923), uint256(0x16d1891acd2fababd66f81bc094876116ed45991ed1286c916956f060c31ef40));
        vk.gamma_abc[21] = Pairing.G1Point(uint256(0x2643354f35f3f9c28aa7aafa5f6178eefeedac36ca47cc1aa4aade63a2f2c066), uint256(0x0666101e342e53c81372966fda5f07e3e2796faf73805b974b5befc003d1552a));
        vk.gamma_abc[22] = Pairing.G1Point(uint256(0x0a4529af07b2c0aa6578faedd52c1fc94a9ed6adcc67f80708cdc89a5799bc70), uint256(0x1faf6e540b67d510fbd8e83516ad3a6f93201f14a0dd54e3abec7cee3a6afdd6));
        vk.gamma_abc[23] = Pairing.G1Point(uint256(0x1227f5a70f264648f4869ca629b2efe15999ff684293b56f9cbce19726a2d928), uint256(0x114735b96168354cd8e891e1cb5142eb533c26e9da7fc72b64df636fb59ae28d));
        vk.gamma_abc[24] = Pairing.G1Point(uint256(0x2fb544f54a26b86cfbdeffa8411bf8b9ebce2e3309a83cb6fdcd06b5fc80ba9f), uint256(0x00e3751800c46a78ea61be6de10a6970fb4804291f3a12f759c001015577fdbd));
        vk.gamma_abc[25] = Pairing.G1Point(uint256(0x19e2c886b0e4b06a4c806f0457d8a94caba14a698ad7ece7d93454d3302932e0), uint256(0x09c1acbd6b94b47ad57aabc259a262750ecf3e4df9a2413fc776e9bfe89e725e));
        vk.gamma_abc[26] = Pairing.G1Point(uint256(0x2e564e95054d9c1e857788fc145614c5249a74e525350d005b9d74ae6ac4bdc1), uint256(0x2bfd8e495c4a72b32e90ad5e37edf1a696ea1c95c64ebd0b97a7a4d1ef592aa1));
        vk.gamma_abc[27] = Pairing.G1Point(uint256(0x303a8911a4661e29d668b69823a3c70b5d3f2e8f2bc0a16cc17a67c74ddf21e9), uint256(0x000f856959cf20bbd1c618397dd63fdadb793410685fbb5c93845dbdc75ca060));
        vk.gamma_abc[28] = Pairing.G1Point(uint256(0x25c115fe7a626d40167b0d4b80e54d47f24349a979723eeace38e0768320c8e3), uint256(0x19a9d4b0f1eb9948a9d784b799a3dbd62b96025c2324d30353948e7fd7cadb11));
        vk.gamma_abc[29] = Pairing.G1Point(uint256(0x0a578ef2ab0ed1f4a3c4e2e320298a1362a095e43ed4caa4904d405772dafc22), uint256(0x00c807e096732d550f656375df69e08f59f4bb48aad7bc65d23db63d243dc3f1));
        vk.gamma_abc[30] = Pairing.G1Point(uint256(0x1f0f3fae6e05dfd88985c02b512fa8562c2a841a7f31f1359120c4fe972a101e), uint256(0x1280fbf6cb1d912b580d8c147da780d7568542f1311bc3b726c171669ba083d5));
        vk.gamma_abc[31] = Pairing.G1Point(uint256(0x0f4daf8d6457b986ccaca01c951f55e5c7820e0354b36f78c2a1e2247cde673c), uint256(0x18e5fa94411aaacb7c9bcf75e50dd48ce84677425f7a8a18fd1630dda6bf2b8c));
        vk.gamma_abc[32] = Pairing.G1Point(uint256(0x01c6cf6cb00b20461e4d6ab7e66877c1c472490c3908388b65a07d6bcbe28367), uint256(0x24a5d33933bd75a4e939bf96fa8da09aa6e144ab2634a6c2650a89b9fd76ebc0));
        vk.gamma_abc[33] = Pairing.G1Point(uint256(0x08e129a49a0c321ff280ce25e7eb21b2926b64b34fa2c1ac68fcde046965778e), uint256(0x03aa10362b4f26a334ea29bbe58cece2af77737fa95241e71c8b1ab443e1c3e5));
        vk.gamma_abc[34] = Pairing.G1Point(uint256(0x02d30048996c71a225e71ac6111ad75d5e7c3378c78356caa8a2d2806b1dddf5), uint256(0x0a37e0f43c6e56d3e0da2c254aac685f66f4f8d2f65505733ee08b2a8a459374));
        vk.gamma_abc[35] = Pairing.G1Point(uint256(0x2cfff1e76680364d6cb83d728373413bed9a5d1e982f8e47f3c07b1862645bd6), uint256(0x1162ed82dc0ea6e231d62464da26767be63de78162c807c74403cb5aa3117d09));
        vk.gamma_abc[36] = Pairing.G1Point(uint256(0x0212077486090645b37a18451e77a889ab33d1b00a27a863d6235df9bdd1ee05), uint256(0x2728776e5abf850712c8125853ef72b371eadededc7390476462934386de23c3));
        vk.gamma_abc[37] = Pairing.G1Point(uint256(0x0d9755288e1d0bd09f25aed0972724f9d6b774f9d2eca51449ff6e03a6a8bd93), uint256(0x190255b0e96d687417eacf8a0c1f0bf8a68215fd89d6aa6541a6b8b8e53dcf1e));
        vk.gamma_abc[38] = Pairing.G1Point(uint256(0x2bce17b981c5a258b3470455f56517163ccfde0e8d6243faae7136cd1cc86294), uint256(0x1c42f279450bedc51464a6885235f0cb4326131def625eebea6626261ba0c7e8));
        vk.gamma_abc[39] = Pairing.G1Point(uint256(0x0f05c5287a6e885d54edd9257f1cd41bec731404acd9de36bda958db347a5013), uint256(0x130e5ee0997196d064b9156fc42201d3f59ea53babf85397ddb0e7e7714096ac));
        vk.gamma_abc[40] = Pairing.G1Point(uint256(0x2ad6a6429f3f4375259b127e4af7f032371811f89266632d0ac53f59f8f8f656), uint256(0x13351ed2ac5a38d6de7d513027a35456a84a93cad2e4d652937833da46f0fa47));
        vk.gamma_abc[41] = Pairing.G1Point(uint256(0x21a0eb4ffd39394d142088fa7ad4e93daeb0ce75a323f534b13659f7a9a98600), uint256(0x2cdc7dcd7aa34e8e2b677edf2245f97a0085e742b1f240000b1d128292d04ead));
        vk.gamma_abc[42] = Pairing.G1Point(uint256(0x0d907ccce22e5ea8b7623f8250fe2bec6b67b8ba5ec190959d86256a7ab29e87), uint256(0x27cc8db8fac1d8920a4dbdb56774bae4b3affecb4142b1d54ee121deb4f19973));
        vk.gamma_abc[43] = Pairing.G1Point(uint256(0x05866437a450ed1daf60b19b604ae1b70a9fdd296082b05ba65e596738026e33), uint256(0x277cdbe3554cc604454370e2ec1d94e9dfdebf79604447b30ca2283b42c6c8f1));
        vk.gamma_abc[44] = Pairing.G1Point(uint256(0x1bd1d1d58b4dad6bf22c66bfb27821a3894fd6436d40c1a6bbf39fdd4a05c065), uint256(0x2bcde31df1ab170e26e3d7739a58470d6ee74f9e337f319a1303e1da91aa60fe));
        vk.gamma_abc[45] = Pairing.G1Point(uint256(0x2be50eaf3a4bd7a04c7b020b611ca9d62e55b5d932d8f685cd2f93ea31aca4fd), uint256(0x0311edacb0ecbabfd448d694ec5a1c1b3d59191dd8174a3239a8a38affbbf671));
        vk.gamma_abc[46] = Pairing.G1Point(uint256(0x2086b6c405884df471c26ae12738dfb01f28f70a6e6b5456ce2369ecea3b2b60), uint256(0x1e61b9ecc09f001430a9549a60b1de3f71afa3bb26229b29a72ac25f7150bc07));
        vk.gamma_abc[47] = Pairing.G1Point(uint256(0x3011c900874b28bb2dbb792228628c325ada2035b8c8a9fd54048cdec07bb9a1), uint256(0x21982fe6c114e09afdd83b78184d899e5da385b589f38852df2a0a913d053688));
        vk.gamma_abc[48] = Pairing.G1Point(uint256(0x2a402b53a74c3da3e91e9c5b1c401d9c055941fef8485ad42b5034f4cdc8f8e5), uint256(0x16ce04e1b6ae0a61df4425dc6f496d0efa712ce4ee6bf9136125ee87c6bff5fa));
        vk.gamma_abc[49] = Pairing.G1Point(uint256(0x074c5e65f2f9a538f0fdae35fbea155fad84178126eb4757f8a9a7cd49cc8868), uint256(0x2882c5860c71bc5030e6d62ac8323e97009afc0a61985f64c4aa346320d9f990));
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
            Proof memory proof, uint[49] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](49);
        
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

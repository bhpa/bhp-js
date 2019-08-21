export default {
  MainNet: {
    Name: "MainNet",
    ProtocolConfiguration: {
      Magic: 58876898,
      AddressVersion: 23,
      StandbyValidators: [
        "03e2a25adfc636cfbaa693539bf41e72917466ba2f95ed472a21cbf0c1b138ae96",
        "023c2c27d875fa92be23a7dd4035c199320a5ea2129d966fec5fdb5ea434123be9",
        "023beac0024fefda918bc40e5ec132ba4c24f4832556ccd63548c5b16f80820034",
        "02137d620054a82950e204453787929e6fa88623084eec26ef3cf37ac53376bf33"
      ],
      SeedList: [
        "seed01.bhpa.io:20555",
        "seed02.bhpa.io:20555",
        "seed03.bhpa.io:20555",
        "seed04.bhpa.io:20555",
        "seed05.bhpa.io:20555",
        "seed06.bhpa.io:20555",
        "seed07.bhpa.io:20555",
        "seed08.bhpa.io:20555"
      ],
      SystemFee: {
        EnrollmentTransaction: 1000,
        IssueTransaction: 500,
        PublishTransaction: 500,
        RegisterTransaction: 10000
      }
    },
    ExtraConfiguration: {
      bhpDB: "https://exp.bhpa.io",
      bhpscan: "https://exp.bhpa.io"
    }
  },
  TestNet: {
    Name: "TestNet",
    ProtocolConfiguration: {
      Magic: 15835875,
      AddressVersion: 23,
      StandbyValidators: [
        "029144afe6f10a4841e0787cbcca8fa297464ec9f6b9d8a1f1170e49ead5e1bc59",
        "02c61ec47f8af4b333ed5e680f194d56be78786cd22fe0638750d0dc3bec7e3496",
        "030492b9b949da9ad32fec45b596f5db0cf172a4676fae3726d35ba02e10b9f098",
        "037801dc2903baa4163b44302f33f43e0e12999782144c871060e23a478eeaa484"
      ],
      SeedList: [
        "47.103.46.191:10555",
        "47.103.46.191:20555",
        "47.103.46.213:10555",
        "47.103.46.213:20555"
      ],
      SystemFee: {
        EnrollmentTransaction: 1000,
        IssueTransaction: 500,
        PublishTransaction: 500,
        RegisterTransaction: 10000
      }
    },
    ExtraConfiguration: {
      bhpDB: "https://texp.bhpa.io",
      bhpscan: "https://texp.bhpa.io"
    }
  }
};

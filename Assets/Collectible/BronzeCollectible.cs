using UnityEngine;

public class BronzeCollectible : CoinCollectible
{
    private void Awake()
    {
        coinValue = 1;  // Bronze coins are worth 1
    }

    public override void Collect()
    {
        base.Collect();  // Call the base class collect method
        // Additional logic for bronze coins can be added here if needed
    }


     private PlayerMovement playerMovement;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    


    // Update is called once per frame
    void Update()
    {
        
    }
}

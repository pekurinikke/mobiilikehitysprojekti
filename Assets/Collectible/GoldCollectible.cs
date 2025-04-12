using UnityEngine;

public class GoldCollectible : CoinCollectible
{
    private void Awake()
    {
        coinValue = 10;  // Gold coins are worth 10
    }

    public override void Collect()
    {
        base.Collect();  // Call the base class collect method
        // Additional logic for gold coins can be added here if needed
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

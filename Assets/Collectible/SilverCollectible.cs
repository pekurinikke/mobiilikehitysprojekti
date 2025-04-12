using UnityEngine;

public class SilverCollectible : CoinCollectible
{
    private void Awake()
    {
        coinValue = 5;  // Silver coins are worth 5
    }

    public override void Collect()
    {
        base.Collect();  // Call the base class collect method
        // Additional logic for silver coins can be added here if needed
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

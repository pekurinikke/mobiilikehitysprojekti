using UnityEngine;

public class CoinCollectible : MonoBehaviour
{
    public int coinValue;
    public bool isCollected = false; // Now public so PlayerMovement can check it

    public virtual void Collect()
    {
        if (isCollected) return; // Prevent multiple collections

        isCollected = true;  
        Debug.Log("Collected a coin worth " + coinValue);
        gameObject.SetActive(false); // Hide before destroying
        Destroy(gameObject, 0.1f);
    }
}
